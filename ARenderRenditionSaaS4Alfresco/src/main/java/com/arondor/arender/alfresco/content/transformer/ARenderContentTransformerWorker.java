package com.arondor.arender.alfresco.content.transformer;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.UUID;

import org.alfresco.repo.content.transform.ContentTransformerWorker;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.TransformationOptions;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpStatus;
import org.springframework.beans.factory.InitializingBean;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

public class ARenderContentTransformerWorker implements ContentTransformerWorker, InitializingBean
{
    private String arenderARenderSaaSUrl = "https://rendition.saas.arender.io/test/";

    private String aRenderRenditionApiKey = "baseApiKey";

    @Override
    public boolean isAvailable()
    {
        RestTemplate template = new RestTemplate();
        final String uriString = arenderARenderSaaSUrl + "health/records?api-key=" + aRenderRenditionApiKey;
        final ResponseEntity<String> responseEntity = template.getForEntity(uriString, String.class);
        return HttpStatus.SC_OK == responseEntity.getStatusCode().value();
    }

    @Override
    public String getVersionString()
    {
        return "1.0.0";
    }

    @Override
    public boolean isTransformable(String sourceMimetype, String targetMimetype, TransformationOptions options)
    {
        return "application/pdf".equals(targetMimetype);
    }

    @Override
    public String getComments(boolean available)
    {
        // no comments yet to add
        return null;
    }

    @Override
    public void transform(ContentReader reader, ContentWriter writer, TransformationOptions options) throws Exception
    {
        try (InputStream contentInputStream = reader.getContentInputStream();
             OutputStream contentOutputStream = writer.getContentOutputStream())
        {
            String documentId = UUID.randomUUID().toString();
            int httpCode = uploadFile(contentInputStream, documentId, "DocumentTitle",
                    "MimeType");
            if(HttpStatus.SC_OK == httpCode)
            {
                byte[] pdfFileFromRenditionSaaS = getPDFFileFromRenditionSaaS(documentId);
                IOUtils.write(pdfFileFromRenditionSaaS, contentOutputStream);
            }
        }
    }

    /**
     *
     * @param fileInputStream: the file to convert to either PDF, MP3 or MP4
     * @param documentId: the document identifier of your choice
     * @param documentTitle: the title of the document to upload
     * @param mimeType: the mimeType of the document to upload
     * @return HTTP Code of the REST Call
     */
    public int uploadFile(InputStream fileInputStream, String documentId, String documentTitle, String mimeType)
    {
        RestTemplate template = new RestTemplate();
        final String uriString =
                arenderARenderSaaSUrl + "document/" + documentId + "/upload/" + "?api-key=" + aRenderRenditionApiKey
                        + "&documentTitle=" + documentTitle + "&mimeType=" + mimeType;

        HttpEntity<InputStreamResource> documentContent = new HttpEntity<InputStreamResource>(
                new InputStreamResource(fileInputStream),
                new HttpHeaders()
                {
                    {
                        set("Content-Type", MediaType.APPLICATION_OCTET_STREAM_VALUE);
                    }
                });
        final ResponseEntity<Void> voidResponseEntity = template.postForEntity(uriString, documentContent, Void.class);
        return voidResponseEntity.getStatusCode().value();
    }

    /**
     *
     * @param documentId: the UUID matching an already uploaded document (should have been uploaded less than one hour ago
     * @return the converted version of the upload Document (can be PDF, MP3 or MP4 depending on the orginal file
     */
    public byte[] getPDFFileFromRenditionSaaS(String documentId)
    {
        RestTemplate template = new RestTemplate();
        final String uriString =
                arenderARenderSaaSUrl + "accessor/getContent/raw/" + documentId + "/RENDERED" + "?api-key=" +
                        aRenderRenditionApiKey;
        final ResponseEntity<byte[]> responseEntity = template.getForEntity(uriString, byte[].class);
        if(HttpStatus.SC_OK == responseEntity.getStatusCode().value())
        {
            return responseEntity.getBody();
        }
        else
        {
            return null;
        }
    }

    @Override
    public void afterPropertiesSet()
    {
        // NOTHING TO DO HERE
    }

    public String getArenderARenderSaaSUrl()
    {
        return arenderARenderSaaSUrl;
    }

    public void setArenderARenderSaaSUrl(String arenderARenderSaaSUrl)
    {
        this.arenderARenderSaaSUrl = arenderARenderSaaSUrl;
    }

    public String getaRenderRenditionApiKey()
    {
        return aRenderRenditionApiKey;
    }

    public void setaRenderRenditionApiKey(String aRenderRenditionApiKey)
    {
        this.aRenderRenditionApiKey = aRenderRenditionApiKey;
    }
}
