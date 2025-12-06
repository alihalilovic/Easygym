namespace Easygym.Domain.Interfaces;

public interface IBlobStorageService
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType);
    Task DeleteAsync(string blobUrl);
    Task<(Stream Stream, string ContentType, string FileName)> DownloadAsync(string blobUrl);
}
