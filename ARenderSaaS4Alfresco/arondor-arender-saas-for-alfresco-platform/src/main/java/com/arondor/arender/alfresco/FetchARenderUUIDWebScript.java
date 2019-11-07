package com.arondor.arender.alfresco;

import java.io.Closeable;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

import com.google.common.base.Strings;

public class FetchARenderUUIDWebScript extends DeclarativeWebScript
{
    private static final String MODEL_PARAM_UUID = "UUID";

    private static final String DEFAULT_ARENDER_ID = "b64_I2RlZmF1bHQ=";

    private String arenderUrl;

    private String apiKey;

    private ContentService contentService;

    private NodeService nodeService;

    public FetchARenderUUIDWebScript()
    {
        arenderUrl = "https://saas.arender.io/";
        apiKey = "baseApiKey";
    }

    @Override
    protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache)
    {
        Map<String, Object> model = new HashMap<>();
        String nodeRef = req.getParameter("nodeRef");
        if (Strings.isNullOrEmpty(nodeRef))
        {
            model.put(MODEL_PARAM_UUID, DEFAULT_ARENDER_ID);
            return model;
        }
        try
        {
            // try to see if SaaSARender already has this document
            String refId = nodeRef;
            String docId = checkIfUUIDExists(refId);
            if (docId != null)
            {
                model.put(MODEL_PARAM_UUID, docId);
            }
            else
            {
                NodeRef ref = new NodeRef(refId);
                model.put(MODEL_PARAM_UUID,
                        getARenderUUID(getAlfrescoInputStream(ref), refId, getDocumentNameOrTitle(ref)));
            }
        }
        catch (IOException e)
        {
            model.put(MODEL_PARAM_UUID, DEFAULT_ARENDER_ID);
            return model;
        }
        return model;
    }

    public String getDocumentNameOrTitle(NodeRef ref)
    {
        Serializable property = nodeService.getProperty(ref, ContentModel.PROP_NAME);
        if (property != null)
        {
            return property.toString();
        }
        property = nodeService.getProperty(ref, ContentModel.PROP_TITLE);
        if (property != null)
        {
            return property.toString();
        }
        return "uploadedDocument";
    }

    private InputStream getAlfrescoInputStream(NodeRef nodeRef)
    {
        ContentReader contentReader = contentService.getReader(nodeRef, ContentModel.PROP_CONTENT);
        return contentReader.getContentInputStream();
    }

    public String getARenderUUID(InputStream stream, String refId, String documentTitle) throws IOException
    {
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost uploadFile = new HttpPost(
                (new StringBuilder()).append(arenderUrl).append("arendergwt/uploadServlet?api-key=").append(apiKey)
                        .append("&uuid=").append(URLEncoder.encode(refId, "UTF-8")).toString());
        MultipartEntityBuilder builder = MultipartEntityBuilder.create();
        builder.addBinaryBody("file", stream, ContentType.APPLICATION_OCTET_STREAM, documentTitle);
        HttpEntity multipart = builder.build();
        uploadFile.setEntity(multipart);
        CloseableHttpResponse response = httpClient.execute(uploadFile);
        return (new String(read(response.getEntity().getContent()))).replace("|", "").trim();
    }

    public String checkIfUUIDExists(String refId) throws IOException
    {
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpGet get = new HttpGet((new StringBuilder()).append(arenderUrl).append("arendergwt/uploadServlet?api-key=")
                .append(apiKey).append("&uuid=").append(URLEncoder.encode(refId, "UTF-8")).toString());
        CloseableHttpResponse response = httpClient.execute(get);
        int statusCode = response.getStatusLine().getStatusCode();
        if (statusCode == HttpStatus.SC_OK)
        {
            // the document already exists
            return (new String(read(response.getEntity().getContent()))).replace("|", "").trim();
        }
        else
        {
            return null;
        }
    }

    private byte[] read(InputStream is) throws IOException
    {
        try
        {
            return IOUtils.toByteArray(is);
        }
        finally
        {
            closeQuietly(is);
        }
    }

    protected void closeQuietly(Closeable closeable)
    {
        try
        {
            if (closeable != null)
            {
                closeable.close();
            }
        }
        catch (IOException ioexception)
        {
        }
    }

    public void setArenderUrl(String arenderUrl)
    {
        this.arenderUrl = arenderUrl;
    }

    public String getArenderUrl()
    {
        return arenderUrl;
    }

    public ContentService getContentService()
    {
        return contentService;
    }

    public void setContentService(ContentService contentService)
    {
        this.contentService = contentService;
    }

    public String getApiKey()
    {
        return apiKey;
    }

    public void setApiKey(String apiKey)
    {
        this.apiKey = apiKey;
    }

    /**
     * @param nodeService
     *            The NodeService to set.
     */
    public void setNodeService(NodeService nodeService)
    {
        this.nodeService = nodeService;
    }
}
