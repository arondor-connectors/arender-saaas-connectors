# ARenderRenditionSaaS4Alfresco - Using ARenderRenditionSaaS as a rendition/transformation module for Alfresco

Using *ARender* powerful REST API java client implementation, it is very simple to use ARender as a custom rendition service for Alfresco.

In this code, you'll find a ready to build module for Alfresco to deposit into alfresco *WEB-INF/lib/* folder. 

## Configuration

To configure the module, you have to, first, alter into the file named *service-context.xml* the aRenderRenditionApiKey property with the value of your ARenderRenditionSaaS api-key.

### In *service-context.xml*, setting your api-key

By default, it will contain this value: 

```xml
    <bean id="transformer.worker.arender2pdf" class="com.arondor.arender.alfresco.content.transformer.ARenderContentTransformerWorker">
    	<property name="arenderARenderSaaSUrl" value="https://rendition.saas.arender.io/test/"/>
        <property name="aRenderRenditionApiKey" value="baseApiKey"/>
    </bean>
```

If your api-key is, as an example AzertY, this is how you should change the XML file content : 

```xml
    <bean id="transformer.worker.arender2pdf" class="com.arondor.arender.alfresco.content.transformer.ARenderContentTransformerWorker">
    	<property name="arenderARenderSaaSUrl" value="https://rendition.saas.arender.io/test/"/>
        <property name="aRenderRenditionApiKey" value="AzertY"/>
    </bean>
```

