-   [API Gateway](#api-gateway)

# API Gateway

Amazon API Gateway is fully managed service that makes it easy for developers to publish, maintain, monitor, and secure APIs at any scale. With a few clicks in the AWS Management Console, you can create an API that acts as a _front door_ for applications to access data, business logic, or functionaily from your back-end services, such as applications running on EC2, code running on AWS Lambda, or any web application.

You can enable API caching in Amazon API Gateway to cache your endpoint's response. With caching, you can reduce the number of calls made to your API. When you enable caching for a stage, API Gateway caches responses from your endpoint for a specified time-to-live (TTL) period, in seconds. API Gateway then responds to the request by looking iup the endpoint response from the cache instead of making a request to your endpoint.

-   low cost and efficient
-   scales effortlessly
-   you can throttle requests to prevent attacks
-   connect to cloudwatch to log all requests

## Same Origin Policy

In computing, the same-origin policy is an important concept in the web application security model. Under the policy, a web browser permits scripts contained in a first web page to access data in a second web page, but only if both web pages have the same origin.

## CORS (Cross-Origin Resource Sharing)

CORS is one way the server at the other end (not the client code in the browser) can relax the same-origin policy.

CORS is a mechanism that allows restricted resources (e.g. fonts) on a web page to be requested from another domain outside the domain from whichc the first resource was served.

Error - _Origin policy cannot be read at the remote resource_ => you need to enable CORS on API Gateway
