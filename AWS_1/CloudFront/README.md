-   [CloudFront](#cloudfront)
    -   [distrubution](#distrubution)
    -   [regional edge cache](#regional-edge-cache)
    -   [S3 bucket as origin](#s3-bucket-as-origin)
    -   [EC2 webserver as origin](#ec2-webserver-as-origin)
    -   [S3 static website as origin](#s3-static-website-as-origin)
    -   [how to configure](#how-to-configure)
    -   [domain name vs CNAME](#domain-name-vs-cname)
    -   [cache behavior](#cache-behavior)
        -   [viewer protocol policy](#viewer-protocol-policy)
    -   [invalidating objects](#invalidating-objects)
    -   [field level encryption](#field-level-encryption)
    -   [WAF](#waf)
    -   [streaming](#streaming)
    -   [access logs](#access-logs)

# CloudFront

-   the cache servers can communicate with the origin server(s) and fetch the content the users are trying to view/download
-   subsequent requests will be server directly from the caching servers that are distributed across the globe
-   DNS will route user requests to the nearest caching server
-   this will ensure user experience and minimuze the load on the origin servers

-   web pages can be either static or dynamic
-   **static** means unchanged or constant, while **dynamic** means chaniging or lively
-   static web pages contain the same prebuilt content each time the page is loaded, while the content of dynamic web pages can be generated on-the-fly
    -   static content by definition is _cacheable_
-   standard HTML pages are static web pages

    -   they contain HTML code, which defines the structure and content of the web page
    -   each time an HTML page is loaded, it looks the same
    -   the only way the content of an HTML page will change is if the web developer updates and publishes the file

-   other types of web pages, such as PHP, ASP, and JSP pages are dynamic web pages
-   dynamic refers to the fact that the content can be generated on-the-fly
-   these pages contain _server-side_ code, which allows the web server to generate unique content each time the page is loaded
    -   the server may display the current time and data on the web page
    -   it may also output a unique response based on a web form the user filled out
-   many dynamic pages use server-side code to access database information, which enables the page's content to be generated from information stored in the database
-   websites that generate web pages from database information are often called database-driven websites

**query strings**

-   some web applications use query strings to send information to the server
-   a query string is the part of a web request that appears after a _?_ character; the string can contain one or more parameters separated by & characters
-   in the following example, the query string includes two parameters, _color=red_ and _size=large_
    -   _http://d111111avcdef8.cloudfront.net/images/image.jpg?color=red&size=large_

**CloudFront**

-   is a global (not regional) service
    -   it is used Ingress (injection proxy) to upload objects
    -   and egress to distribute content
-   CloudFront is a web service that speeds up distribution of your static and dynamic web content, such as .html, .css, .js and image files to your users
-   CloudFront delivers your content thorugh a worldwide network of data centers called edge locations
-   when a user requests content that you're serving with CloudFront, the user is routed (via DNS resolution) to the edge location that provides the lowest latency, so that content is delivered with the best possible performance

-   if the content is already in the edge location with the lowest latency, CloudFront delivers is immediately
    -   this dramatically reduces the number of networks that your users' requests must pass through which imporves performance
-   if not, CloudFront retrieves it from an S3 bucket or an HTTP/web server that you have identified as the source for the definitive version of your content (origin server)
-   CloudFront also keeps persistent connections with origin servers so files are fetched from the origins as quickly as possible

## distrubution

-   you create a CloudFront distribution (this is a CDN) to instruct CloudFront where you want content to be delivered from, and the details about how to track and manage content delivery
    -   then CloudFront uses edge servers that are close to your viewers (through DNS resolution) to deliver that content quickly when someone wants to see it or use it
-   when CloudFront gets a request for your files/objects, it goes to the origin to get the requested files that it distributes at edge locations

    -   you can use any combination of S3 buckets and HTTP servers as your origin servers

-   when you want to use CloudFront to distribute your content, you create a distribution and specify configuration settings such as

    -   your origin, which is the S3 bucket or HTTP server from which CloudFront gets the files that it distributes
    -   you can specify any combination of up to 25 S3 buckets and/or HTTP servers as your origins

-   you can use web distributions to serve the following content over HTTP and HTTPS
    -   static and dynamic download content, for example, html, css. js and image files, using HTTP or HTTPS
    -   multimedia content on demand using progressive download and Apple HTTP Live Streaming (HSL)
-   **you can't** serve Adobe Flash multimedia content over HTTP or HTTPS, but you can serve it using a CloudFront RTMP distribution
-   for web distributions, your origin can be either an S3 bucket or an HTTP server
-   a live event, such as a meeting, conference, or concert, in real time
    -   for live streaming, you create the distribution automatically by using an AWS CloudFront stack

Also you need to specify

-   whether you want the files to be available to everyone or you want to restrict access to selected users
-   whether you want CloudFront to require users to use HTTPS to access your content
-   whether you want CloudFront to forward cookies and/or query strings to your origin (for web distributions only), and if so, whether to cache your content based on all parameters or on selected parameters
-   whether you want CloudFront to prevent users in selected countries from accessing your content (geo restrictions with CloudFront distributions)
-   whether you want CloudFront to create access logs

**when you save changes to your distribution configuration**

-   CloudFront starts to propagate the changes to all edge locations
-   until your configuration is updated in an edge location, CloudFront continues to serve your content from that location based on the previous configuration
-   your changes don't propagate to every edge location instantaneously
    -   while CloudFront is propagating your changes, AWS can't determine whether a given edge location is serving your content based on the previous configuration or the new configuration
    -   when propagation is complete, the status of your distribution changes from **InProgress** to **Deployed**
-   after your configuration is updated in an edge location, CloudFront immediately starts to serve your content from that location based on the new configuration

### RTMP distributions

-   RTMP distributions stream media files using Adobe Media Server and the Adobe Real-Time Messaging protocol (RTMP)
-   an RTMP distribution must use an S3 bucket as the origin
-   CloudFront lets you create a total of up to 200 web distributions and 100 RTMP distributions for an AWS account

## regional edge cache

-   CloudFront has added serveral regional edge cache locations globally, at close proximity to your viewers
    -   they are located between your origin webserver and the global edge locations that serve content directly to your viewers
    -   as objects become less popular, individual edge locations may remove those objects to make room for more popular content
    -   regional edge caches have a larger cache width than any individual edge location, so objects remain in the cache longer at the nearest regional edge caches
-   regional edge cache locations are currently used only for requests that need to go back to a custom origin, i.e requests to S3 origins will skip regional edge cache locations
-   serving less popular content from regional edge caches is enabled by default for all new and existing CloudFront distributions; there are no additional charges to use this feature

-   when a viewer makes a request on your website or though your application, DNS routes the request to the CloudFront edge location that can best serve the user's request
-   this location is typically the nearest CloudFront edge location in terms of latency
-   in the edge loaction, CLoudFront checks its cache for the requested files

    -   if the files are in the cache, CloudFront returns them to the user
    -   if the files are not in the cache, the edge servers go to the nearest regional edge cache to fetch the object

-   regional edge caches have feature parity with edge locations, for example, a cache invalidation request removes an object from both edge caches and regional edge caches before it expires
    -   the next time a viewer requests the object, CloudFront returns to the origin to fetch the latest version of the object
-   proxy methods PUT/POST/PATCH/OPTIONS/DELETE go directly to the origin from the edge locations and do not proxy through the regional edge caches
-   regional edge caches are used for custom origins, but not S3 origins
-   dynamic content, as determined at request time (cache-behavior configured to forward all headers), does not flow through regional edge caches, but goes directly to the origin

## S3 bucket as origin

-   when you use S3 bucket as an origin for your distribution, you place any objects that you want CloudFront to deliver in an S3 bucket
-   you can use any method that is supported by S3 to get your objects into S3
-   you can create a hierarchy in your bucket to store the objects, just as you would with any other S3 bucket
-   using an existing S3 bucket as your CloudFront origin server doesn't change the bucket in any way

    -   you can still use it as you normally would to store and access S3 objects at the standard S3 price

-   you incur regular S3 charges for storing the objects in the bucket
-   upload your content to your origin servers; if you don't want to restrict access to your content using CloudFront signed URLs, make the objects publicly readable

-   you are responsible for ensuring the security of your origin server
-   you must ensure that CloudFront has permissions to access the server and that the security settings are appropriate to safeguard your content

## EC2 webserver as origin

-   a custom origin is an HTTP server, the HTTP server can be an EC2 instance or an HTTP server that you manage privately

-   when you use a custom origin that is your own HTTP server, you specify the DNS name of the server along with the HTTP and HTTPS ports and the protocol that you want CloudFront to use when fetching objects from your origin
-   most CloudFront features are supported when you use a custom origin with the following exceptions

    -   **RTMP distributions** - not supported (the origin must be an S3 bucket for media files)

-   if you use EC2 for your custom origins, AWS recommends the following
    -   use an AMI that automatically installs the software for a webserver
    -   use an ELB load balance to handle traggic across multiple EC2 instance and to isolate your application form changes to EC2 instances
    -   when you create your CloudFront distribution, specify the URL of the load balancer for the domain name of your origin server

## S3 static website as origin

-   you can set up an S3 bucket that is configured as a website endpoint **as custom origin with CloudFront**
-   when you configure your CloudFront distribution, for the origin, enter the S3 static website hosting endpoint for your bucket

    -   this value appears in the S3 console, on the _properties_ page under _static website hosting_
        -   example: _http://bucket-name.s3-website-us-west-2.amazonaws.com_

-   when you specify the bucket name in this format as your origin, you can use S3 redirects and S3 custom error documents

## how to configure

1.  you upload your files to your origin servers

    -   your files, **also known as objects**, typically include web pages, images, and media files, but can be anything that can be served over HTTP or a supported version of Adobe RTMP, the protocol used by Adobe Flash Media Server
    -   if you're using an S3 bucket as an origin server, you can make the objects in your bucket publicly readable, so that anyone who knows the CloudFront URLs for your objects can access them. You also have the option of keeping objects private and controlling who accesses them

2.  you create a CloudFront distribution, which tells CloudFront which origin servers to get your files from when users request the files through your web site or application
    -   at the same time, you specify details such as whether you want CloudFront to log all requests and whether you want the distribution to be enabled as soon as it's created
3.  CloudFront assigns a domain name to your new distribution that you can see in the CloudFront console, or that is returned in the response to a programmatic request, for example, an API request

-   by default, each object stays in an edge location for 24 hours before it expires
-   the minimum expiration time is 0 seconds, there isn't a maximum expiration time limit

## domain name vs CNAME

-   when you create a distribution, CloudFront returns a domain name for the distribution

    -   as an example: _d111222abadsd8.cloudfront.net_

-   when you use the CloudFront domain name for your objects, the URL for an object called _/images/tree1.jpg_ is

    -   _http://_d111222abadsd8.cloudfront.net/images/tree1.jpg_

-   to use a different domain name, such as _www.example.com_, instead of the cloudfront.net domain name that CloudFront had assigned to your distribution

    -   you can add an alternate domain name to your distribution for _www.example.com_, you can then use the following URL for _/images/tree1.jpg_
    -   _www.example.com/images/tree1.jpg_
    -   both web and RTMP distributions support alternate domain names

-   configure the DNS service for the domain to route traffic for the domain, such as _example.com_ to the CloudFront domain name for your distribution, such as _d111222abadsd8.cloudfront.net_
    -   the method that you use depends on whether you're using Route53 as the DNS service provider for the domain
        -   **Route53** creates an alias resource record set
            -   with an alias resource record set, you don't pay for Route53 queries
            -   you can create an alias resource record set for the root domain (_example.com_), which DNS doesn't allows for CNAMEs
        -   **Another DNS service provider** - use the method provided by your DNS service provider to add a CNAME resource record set to the hosted zone for your domain

**moving an alternate domain name to a different CloudFront distribution**

-   if you want to move an alternate domain name from one CloudFront distribution to another distribution, the steps you must take depend on the domain name that you want to move
    -   for a subdomain like _marketing.example.com_, you can move the domain yourself
    -   for a domain like _example.com_ (a second-level domain), you must work with AWS support to move the domain to another distribution
    -   if an alternate domain name is already associated with one distribution, it can't be set up with another

## cache behavior

-   a cache behavior lets you configure a variety of CloudFront functionality for a given URL path pattern for files on your website
-   for simplicity, the cache behaviors can be seen as routing requests to the correct origins
    -   for instance, a cache behavior might apply to all _.gif_ files in the images directory on a web server that you're using as the origin server in CloudFront
-   list the cache behaviors in the order that you want CloudFront to evaluate them in, default will always be the last to be processed

-   for each cache behavior you can configure the following functionality
    -   the path pattern
    -   if you have configured multiple origins for your CloudFront distribution, which origin you want CloudFront to forward your requests to
    -   whether to forward query strings to your origin
    -   whether accessing the specified files require signed URLs
    -   allowed HTTP methods, whether to require users to use HTTPS to access those files
    -   the minimum amount of time that those files stays in the CloudFront cache regardless of the value of any Cache-Contorl headers that your origin adds to the files

### HTTP methods

-   two commonly used methods for a request-response between a client and server are GET and POST

    -   **GET** - requests data from a specified resource
    -   **POST** - submits data to be processed to a specified resource

-   other methods include
    -   **HEAD** - same as GET but returns only HTTP headers and no document body
    -   **PUT** - uploads a representation of the specified URI
    -   **DELETE** - deletes the specified resource
    -   **OPTIONS** - returns the HTTP methods that the server supports
    -   **PATCH** - used to apply partial modifiacations to a resource

**allowed HTTP methods**

-   specify the HTTP methods that you want CloudFront to process and forward to your origin
    -   **GET, HEAD** - you can use CloudFront only to get object fro your origin or the get object headers
    -   **GET, HEAD, OPTIONS** - you can use CloudFront only to get objects from your origin, get object headers, or retrieve a list of the options that your origin server supports
    -   **GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE** - you can use CloudFront to get, add, update, and delete objects, and to get object headers; in addition, you can perform other POST operations such as submitting data from a web form

**note** - CloudFront caches responses to GET and HEAD requests and, optionally, OPTIONS request. CloudFront **does not cache responses** to requests that use the other methods

-   you can control user access to your private content in two ways
    -   restrict access to objects in CloudFront edge caches
    -   restrict access to objects in your Amazon S3 bucket

### viewer protocol policy

-   choose the protocol policy that you want viewers to use to access your content in CloudFront edge locations

    -   **HTTP and HTTPS** - viewers can use both protocols
    -   **redirect HTTP to HTTPS** - viewers can use both protocols, but HTTP requests are automatically redirected to HTTPS requests
    -   **only HTTPS** - viewers can only access your content if they're using HTTPS

-   for web distributions, you can configure CloudFront to require that viewers use HTTPS to request your objects, so connections are encrypted when CloudFront communicates with viewers

-   change the **origin protocol policy** for the applicable origins in your distribution

    -   **HTTPS only** - CloudFront users only HTTPS to communicate with your custom origin
    -   **match viewer** - CloudFront communicates with your custom origin using HTTP or HTTPS, depending on the protocol of the viewer request
        -   for example, if you choose **match viewer** for **origin protocol policy** and the viewer uses HTTPS to request an object from CloudFront, CloudFront also uses HTTPS to forward the request to your origin

-   choose **match viewer** only if you specify **redirect HTTP to HTTPS** or **HTTPS only** for **viewer protocol policy**
-   CloudFront caches the object only once even if viewers make requests using both HTTP and HTTPS protocols

## invalidating objects

-   if you need to remove an object from CloudFront edge caches before it expires, you can do one of the following
    -   invalidate the object from edge caches; the nest time a viewer requests the object, CloudFront returns to the origin to fetch the latest version of the object
    -   use object versioning to server a different version of the object that has a different name
-   you can't cancel an invalidation after you submit it

**important**

-   you can invalidate most types of objects that are served by a web distribution, however
    -   you cannot invalidate media files in the Microsoft Smooth Streaming format when you have enabled Smooth Streaming for the corresponding cache behavior (but you can always create a new distribution)

## field level encryption

-   you can configure CloudFront to help enforce secure end-to-end connections to origin servers by using HTTPS
-   field-level encryption adds an additional layer of security along with HTTPS that lets you protect specific data throughout system processing so that only certain applications can see it
-   field-level encryption allows you to securely upload user-submitted sensitive information to your web server
    -   the sensitive information provided by your clients is encrypted at the edge closer to the user and remains encrypted throughout your entire application stack, ensuring that only applications that need the data - and have the credentials to decrypt it - are able to do so

## WAF

-   AWS WAF as a web application firewall that lets you monitor the HTTP and HTTPS requests that are forwarded to CloudFront, and lets you control access to your content
-   based on conditions that you specify, such as the IP addresses that requests originate from or the values of query strings, CloudFront responds to requests either with the requested content or with an HTTP 403 status code (forbidden)
-   you can also configure CloudFront to return a custom error page when a request is blocked
-   after you create an AWS WAF web access control list (web ACL), you create or update a web distribution and associate the distribution with a we ACL; you can associate as many CloudFront distributioins as you want with the same web ACL or with different web ACLs

**geographic distributions of your content**

-   you can _geo restriction_, also known as _geoblocking_, to prevent users us specifuc geographic locations from accessing content that you're distributing through a CloudFront web distribution
-   to use geo restriction, you have two options
    -   use CloudFront geo restriction feature
        -   use this option to restrict access to all of the files that are associated with a distribution and to restrict access at the country level
    -   use a third-party geolocation service

## streaming

-   you can use CloudFront web distributions to serve **on-demand streaming media files** from any **HTTP origin (i.e web distributions)**
-   several examples of working with different origins to server streaming video content

    -   configuring on-demand with AWS Elemental Media-Store
    -   configuring on-demand Smooth Streaming
    -   configuring on-demand Progressive Downloads
    -   configuring on-demand Apple HTTP Live Streaming (HSL)

-   the key message is, you do not have to use RTMP distributions to serve streaming video using CloudFront, you can do so using web distributions

-   when you use HTTP to serve media content, AWS recommends that you use an HTTP-based (i.e web distribution not RTMP) dynamic streaming protocol such as

    -   Apple HTTP Dynamic Streaming (Apple HDS)
    -   Apple HTTP Live Streaming (Apple HSL)
    -   Microsoft Smooth Streaming
    -   or MPEG-DASH

-   for dynamic-streaming protocols, a video is divided into a lot of small segments that are typically just a few seconds long each
    -   if the users commonly stop watching before the end of a video (for example, because they close their viewer during the credits)
        -   CloudFront has still cached all of the small segmets up to that point in the video

### RTMP

-   to stream media files using CLoudFront, you need to provide two types of files to the end user

    -   the media files
    -   a media player, for example, **JW Player, Flowplayer, or Adobe Flash**

-   end users view the media files using the media player that is provided to them
    -   they do not use the media player (if any) that is already installed on their computers or other device
-   when an end user streams the media file, the media player begins to play the content of the file while the file is still being downloaded from CloudFront

    -   the media file in not stored locally on the end user's system

-   to use CloudFront to serve both the media player and media files, you need two types of distributions
    -   web distribution for the media player
    -   an RTML distribution for the media files
-   **web distribution serve files over HTTP**, while **RTMP distributions stream media files over RTMP** (or a variant of RTMP)
-   media files **must be stored in an AWS S3 bucket**, custom origins are not supported
-   the media player can be in the same S3 bucket, a different S3 bucket, or in a custom HTTP origin server, while served using CloudFront

## access logs

-   you can configure CloudFront to create log files that contain detailed information about every user request that CloudFront receives
-   these access logs are avaialble for both web and RTMP distributions
-   if you enable logging, you can specify the Amazon S3 bucket that you want CloudFront to save files in
-   you can enable logging as an option that you specify when you're creating a distribution
-   one way to analyze your access logs is to use Amazon Athena. Athena is an interactive query service that can help you analyze data for AWS services, including CloudFront
-   we recommend that you use the logs to understand the nature of the requests for your content, not as a complete accounting of all requests. CloudFront delivers access logs on a best-effort basis
