using Easygym.Application.Services;
using Easygym.Domain.Constants;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Easygym.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MealLogController : ControllerBase
    {
        private readonly MealLogService _mealLogService;
        private readonly IBlobStorageService _blobStorageService;
        private readonly CurrentUserService _currentUserService;
        private readonly IMealLogRepository _mealLogRepository;
        private const long MaxFileSize = 10 * 1024 * 1024; // 10MB
        private static readonly string[] AllowedImageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        private static readonly string[] AllowedVideoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
        private static readonly string[] AllowedContentTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/webm"];

        public MealLogController(
            MealLogService mealLogService,
            IBlobStorageService blobStorageService,
            CurrentUserService currentUserService,
            IMealLogRepository mealLogRepository)
        {
            _mealLogService = mealLogService;
            _blobStorageService = blobStorageService;
            _currentUserService = currentUserService;
            _mealLogRepository = mealLogRepository;
        }

        // Log a meal for the current client
        [HttpPost]
        [Authorize(Roles = Role.Client)]
        public async Task<IActionResult> LogMeal([FromBody] LogMealRequest request)
        {
            var result = await _mealLogService.LogMealAsync(request);
            return Ok(result);
        }

        // Unlog a meal (uncheck)
        [HttpDelete]
        [Authorize(Roles = Role.Client)]
        public async Task<IActionResult> UnlogMeal([FromBody] UnlogMealRequest request)
        {
            await _mealLogService.UnlogMealAsync(request);
            return Ok();
        }

        // Get daily progress for a specific date
        // Clients: get their own progress
        // Trainers: must specify clientId query param
        [HttpGet("daily")]
        [Authorize(Roles = Role.ClientAndTrainer)]
        public async Task<IActionResult> GetDailyProgress([FromQuery] DateOnly date, [FromQuery] int? clientId = null)
        {
            var progress = await _mealLogService.GetDailyProgressAsync(date, clientId);
            return Ok(progress);
        }

        // Get weekly progress starting from a specific date
        [HttpGet("weekly")]
        [Authorize(Roles = Role.ClientAndTrainer)]
        public async Task<IActionResult> GetWeeklyProgress([FromQuery] DateOnly startDate, [FromQuery] int? clientId = null)
        {
            var progress = await _mealLogService.GetWeeklyProgressAsync(startDate, clientId);
            return Ok(progress);
        }

        // Upload media for a meal log
        [HttpPost("upload-media")]
        [Authorize(Roles = Role.Client)]
        public async Task<IActionResult> UploadMealMedia([FromForm] IFormFile file, [FromForm] int mealId, [FromForm] string logDate)
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
            var allowedExtensions = AllowedImageExtensions.Concat(AllowedVideoExtensions).ToArray();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Invalid file type. Only images (JPG, PNG, GIF, WEBP) and videos (MP4, MOV, AVI, MKV, WEBM) are allowed" });
            }

            if (!AllowedContentTypes.Contains(file.ContentType.ToLowerInvariant()))
            {
                return BadRequest(new { message = "Invalid content type" });
            }

            var currentUser = await _currentUserService.GetCurrentUserAsync();

            if (!DateOnly.TryParse(logDate, out var parsedLogDate))
            {
                return BadRequest(new { message = "Invalid log date format" });
            }

            // Generate unique filename
            var fileName = $"meal_{currentUser.Id}_{mealId}_{parsedLogDate:yyyyMMdd}_{Guid.NewGuid()}{extension}";

            // Upload media
            using var stream = file.OpenReadStream();
            var url = await _blobStorageService.UploadAsync(stream, fileName, file.ContentType);

            // Update meal log with media URL
            var updatedLog = await _mealLogRepository.UpdateMediaUrlAsync(currentUser.Id, mealId, parsedLogDate, url);

            if (updatedLog == null)
            {
                // If meal log doesn't exist, delete the uploaded file and return error
                try
                {
                    await _blobStorageService.DeleteAsync(url);
                }
                catch
                {
                    // Ignore deletion errors
                }
                return NotFound(new { message = "Meal log not found. Please log the meal first before uploading media." });
            }

            return Ok(new { mediaUrl = url });
        }

        // Delete media from a meal log
        [HttpDelete("delete-media")]
        [Authorize(Roles = Role.Client)]
        public async Task<IActionResult> DeleteMealMedia([FromBody] DeleteMealMediaRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            var mealLog = await _mealLogRepository.UpdateMediaUrlAsync(currentUser.Id, request.MealId, request.LogDate, null);

            if (mealLog == null)
            {
                return NotFound(new { message = "Meal log not found" });
            }

            if (!string.IsNullOrEmpty(request.MediaUrl))
            {
                try
                {
                    await _blobStorageService.DeleteAsync(request.MediaUrl);
                }
                catch
                {
                    // Continue even if blob deletion fails
                }
            }

            return Ok(new { message = "Media deleted successfully" });
        }
    }
}
