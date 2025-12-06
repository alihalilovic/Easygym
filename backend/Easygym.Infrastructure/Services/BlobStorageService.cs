using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Easygym.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Easygym.Infrastructure.Services;

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;

    public BlobStorageService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureBlobStorage:ConnectionString"];
        _containerName = configuration["AzureBlobStorage:ContainerName"] ?? "profile-pictures";
        _blobServiceClient = new BlobServiceClient(connectionString);
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

        var blobClient = containerClient.GetBlobClient(fileName);

        var blobHttpHeaders = new BlobHttpHeaders
        {
            ContentType = contentType
        };

        await blobClient.UploadAsync(fileStream, new BlobUploadOptions
        {
            HttpHeaders = blobHttpHeaders
        });

        return blobClient.Uri.ToString();
    }

    public async Task DeleteAsync(string blobUrl)
    {
        var blobClient = new BlobClient(new Uri(blobUrl));
        await blobClient.DeleteIfExistsAsync();
    }

    public async Task<(Stream Stream, string ContentType, string FileName)> DownloadAsync(string blobUrl)
    {
        var blobClient = new BlobClient(new Uri(blobUrl));

        var response = await blobClient.DownloadStreamingAsync();
        var properties = await blobClient.GetPropertiesAsync();

        var fileName = Path.GetFileName(blobClient.Name);
        var contentType = properties.Value.ContentType;

        return (response.Value.Content, contentType, fileName);
    }
}
