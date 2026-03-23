using Easygym.Application.Services;
using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace Easygym.Api.Controllers
{
    [Route("api/profile-picture")]
    [Authorize]
    public class ProfilePictureController : ApiControllerBase
    {
        private readonly IBlobStorageService _blobStorageService;
        private readonly IGenericRepository<User> _userRepository;
        private readonly CurrentUserService _currentUserService;
        private readonly ILogger<ProfilePictureController> _logger;
        private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
        private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        private static readonly string[] AllowedContentTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

        public ProfilePictureController(
            IBlobStorageService blobStorageService,
            IGenericRepository<User> userRepository,
            CurrentUserService currentUserService,
            ILogger<ProfilePictureController> logger)
        {
            _blobStorageService = blobStorageService;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadProfilePicture([FromForm][Required] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded" });
            }

            if (file.Length > MaxFileSize)
            {
                return BadRequest(new { message = $"File size must not exceed {MaxFileSize / (1024 * 1024)}MB" });
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Invalid file type. Only JPG, PNG, GIF, and WEBP images are allowed" });
            }

            if (!AllowedContentTypes.Contains(file.ContentType.ToLowerInvariant()))
            {
                return BadRequest(new { message = "Invalid content type" });
            }

            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var user = await _userRepository.GetByIdAsync(currentUser.Id);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (!string.IsNullOrEmpty(user.ProfilePictureUrl))
            {
                try
                {
                    await _blobStorageService.DeleteAsync(user.ProfilePictureUrl);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(
                        ex,
                        "Failed to delete previous profile picture blob for user {UserId}. Blob URL: {BlobUrl}",
                        user.Id,
                        user.ProfilePictureUrl);
                }
            }

            // Generate unique filename
            var fileName = $"{user.Id}_{Guid.NewGuid()}{extension}";

            // Upload new profile picture
            using var stream = file.OpenReadStream();
            var url = await _blobStorageService.UploadAsync(stream, fileName, file.ContentType);

            // Update user profile picture URL
            user.ProfilePictureUrl = url;
            await _userRepository.UpdateAsync(user);

            return Ok(new { profilePictureUrl = url });
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteProfilePicture()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var user = await _userRepository.GetByIdAsync(currentUser.Id);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (string.IsNullOrEmpty(user.ProfilePictureUrl))
            {
                return BadRequest(new { message = "No profile picture to delete" });
            }

            try
            {
                await _blobStorageService.DeleteAsync(user.ProfilePictureUrl);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Failed to delete profile picture blob for user {UserId}. Blob URL: {BlobUrl}",
                    user.Id,
                    user.ProfilePictureUrl);
            }

            // Remove profile picture URL from user
            user.ProfilePictureUrl = null;
            await _userRepository.UpdateAsync(user);

            return Ok(new { message = "Profile picture deleted successfully" });
        }

        [HttpGet]
        public async Task<IActionResult> GetProfilePicture()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var user = await _userRepository.GetByIdAsync(currentUser.Id);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new { profilePictureUrl = user.ProfilePictureUrl });
        }
    }
}
