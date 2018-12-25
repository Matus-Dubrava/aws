-   [Load Balancer](#load-balancer)
    -   [Classic Load Balancer](#classic-load-balancer)
        -   [Listeners](#listeners)
        -   [Health Checks](#health-checks)
        -   [Cross Zone load balancing](#cross-zone-load-balancing)
        -   [position](#position)
        -   [security groups](#security groups)
        -   [NACL](#nacl)
        -   [session stickiness](#session-stickiness)
        -   [SSL negotiation](#ssl-negotiation)
        -   [connection draining](#connection-draining)
        -   [monitoring](#monitoring)
        -   [scaling](#scaling)

# Load Balancer

-   an Internet-facing load balancer has a publicly resolvable DNS name
-   domain names for content on the EC2 instances served by the ELB, is resolved by the Internet DNS servers to the ELB DNS name (and hence IP addresse(s))
-   this is how traffic from the Internet is directed to the ELB front end
-   there are 3 types of load balancers in the AWS offerings:
    1.  classical load balancer
    2.  application load balancer (layer 7)
    3.  network load balancer (layer 4)

## Classic Load Balancer

Classic load balancer (ELB) service supports

-   HTTP, HTTPS, TCP, SSL (but not HTTP/2)
-   protocol supported are: 1 -> 65535
-   it supports IPv4, IPv6 and Dual Stack

-   it may take some time for the registration of EC2 instances under ELB to complete
-   registered EC2 instances are those that are defined under the ELB
-   ELB has **nothing** to do with the outbound traffic that is initiated/generated from the registered EC2 instances destined to the Internet, or to any other instances within the VPC
-   ELB only has to do with inbound traffic destined to the EC2 registered instances (as the destination) and the respective return traffic
-   you will start to be charged hourly (also for partial hours) once your ELB is active

-   if you do not want to be charged or you do not need the ELB anymore, you can delete it
    -   before you delete the ELB, it is recommended that you point the Route53 (or DNS server) to somewhere else other than the ELB
-   deleting the ELB does not affect, or delete, the EC2 instances registered with it
-   ELB forwards traffic to **eth0** of your registered instance
-   in case the EC2 instance has multiple **IP addresses on eth0**, ELB will route the traffic to its **primary IP address**

-   you can add tags to your ELB
-   in a VPC, ELB supports IPv4 addresses only
-   to ensure that the **ELB service can scale ELB nodes** in each AZ, ensure that the subnet defined for the **load balancer is at least /27 in size, and has at least 8 available IP** addresses the ELB nodes can use to scale

    -   ELB uses these IP addresses to open/connect with your registered EC2 instances (remember this in your security group and NACL settings for ELB environment in your VPC)

-   ELB service can be configured through AWS console, CLI, SDKs
-   ELB name you choose must be unique within the account ELBs in the AWS region
-   **ELB is region specific**, so all registered EC2 instances must be within the same region but can be in different AZs (use Route53 if you want to load balance in different regions)
-   the name can be up to 32 alphanumeric characters, and can NOT start or end with hyphen (-)

-   to define your ELB in AZ, you can select one subnet in that AZ

    -   only one subnet can be defined for the ELB in an AZ
    -   if you try and select another on in the same AZ, it will replace the former one

-   if you register instances in an AZ with the ELB but do not define a subnet in that AZ for the ELB

    -   these instances will not receive traffic from the ELB

-   the ELB is most effective if there is one registered instance at least in each ELB defined AZ

### Listeners

-   an ELB listener, is the process that checks for connection requests
-   you can configure the protocol/port on which your ELB listener listens for connection requests
-   frontend listeners check for traffic from clients to the ELB
-   backend listeners are configured with protocol/port to check for traffic from the ELB to the EC2 instances

-   both frontend and backend listeners can listen on ports 1-65535
-   the ELB supports layer 4 TCP/SSL listeners for both frontend and backend, as well as, layer 7 HTTP/HTTPS listeners for both frontend and backend

**L4**

-   when TCP (layer 4) listeners are used for fronend and backend connections, the ELB forwars the request to the EC2 registered, backend, instances without modifying the headers
-   when the ELB receives the request, it tries to open a TCP connection to the EC2 instance on the port specified in the listener configuration
-   because of this interception, EC2 instance logs would show ELB IP address as the source IP at the EC2 instance received packets
-   to enable proxy protocol on the ELB to force the ELB to carry the connection request details (actual user source IP, source port, etc.) with the request sent to the EC2 instance
-   to enable proxy protocol on your ELB:
    -   ensure the request from the client to the ELB does not pass through a proxy server (on its way before hitting the ELB) with proxy protocol enabled
        -   this will cause the backend instance to receive the requests with two proxy headers
    -   confirm that your EC2 instances can process proxy/protocol information

**L7**

-   to use an HTTPS listener, the ELB must have a X.509 SSL/TLS server certificate, which will be used to terminate the client to ELB HTTPS connection
-   using this certificate the ELB will terminate then decrypt the client session on the ELB itself before sending the request to the backend EC2 instances
    -   this is called SSL termination (offloading)
-   the certificate can be generated using AWS certificate manager (ACM) or you can upload your own to IAM

-   if you do not want this, you can deploy TCP for frontend and backend listeners, and deploy certificates on the backend EC2 instances to terminate the encrypted sessions (basically SSL will be end to end, not decrypted by the ELB)

-   when using HTTP/S for frontend and listeners, the ELB terminates the session, carries the headers in the request, and then sends the request to the EC2 instances
-   since the ELB intercepts the request, and in order for the backed EC2 instances to find the actual source information (original headers)
    -   you can use **x-forwareded-for** header for the request sent from the ELB to the backend instances (**EC2 instances APPs need to read the X-Forwareded-For header**)
-   to ensure that backend instances are available to receive the HTTP/S requests, the ELB establishes one or more TCP connections to each backend instance

### Health Checks

For fault tolerance, it is recommended that you distribute your registered EC2 instances across multiple AZs within the VPC region

-   ideally, have the same number of registered instance in each AZ if possible

-   the **load balancer also monitors the health of its registered instances** and ensures that it routes traffic only yto healthy instances
    -   a healthy instance shows as **In-Service** under ELB
-   when the ELB detects an unhealthy instance, it stops routing traffic to that instance
    -   unhealhty instance shows as **Out-of-Service** under ELB
-   when the ELB service detects the EC2 instance is back healthy, it resumes traffic routing to the instance again

-   by default

    -   AWS console uses ping HTTP (port 80) for health checks
    -   AWS API uses ping TCP (port 80) for health checks

-   registered instances must respond with a HTTP _200 OK_ message within the timeout period, else, it will be considered as unhealthy
-   response timeout is 5 second (range 2 - 60 seconds)

-   _health check interval_

    -   period of time between health checks
        -   defaul 30 (range 5 - 300 seconds)

-   _unhealthy threshold_

    -   number of consecutive failed health checks that should occur before the instance is declared unhealthy
        -   range 2 - 10 (default 2)

-   _healthy threshold_
    -   number of consecutive successful health checks that must occur before the instance is considered healthy
        -   range 2 - 10 (default 10)

### Cross Zone load balancing

-   by default, the ELB distributes traffic evenly between the AZs it is defined in, without consideration to the number of registered EC2 instance in each AZ

-   cross zone load balancing
    -   _is disabled by default_
    -   when enabled, the ELB will distribute traffic evenly between registered instances
        -   if you have 5 EC2 instances in one AZ, and 3 in another, and you enable corss-zone load balancing, each registered EC2 instance will be getting around the same amount of traffic load from the ELB

### position

-   an ELB can be **internet facing** or **internal load balancer**
    -   **internet facing**
        -   ELB nodes will have public IP addresses
            -   DNS will resolve the ELB DNS name to these IP addresses
        -   it routes traffic to the private IP addresses of your registered EC2 instances
            -   hence, why your instances do not have to have public IP addresses
        -   you need one _public_ subnet in each AZ where the internet facing ELB will be defined, such that the ELB will be able to route internet traffic
            -   define this subnet in the ELB configuration
        -   format of the public EBL DNS name of Internet facing ELB:
            -   _name-1234567890.region_.elb.amazonaws.com
    -   **internal ELB**
        -   ELB nodes will have private IP addresses, to which the DNS resolves ELB DNS name
        -   it routes traffic to the private IP addresses of your registered EC2 instances
        -   format of the ELB DNS name for internal ELB:
            -   internal.\_name-123456789.region.\_elb.amazonaws.com

### security groups

-   if you create your ELB in a **non-default VPC**, you can choose a security group for the ELB from existing. If you do not specify one, the default security group of the VPC is assigned to the ELB

-   ELB must always have a security group attached to it (be it a custom, or the default one)
    -   this will control traffic that can reach your ELB's front end listeners
    -   it must also allow health check protocol/port and listener protocol/port (actual traffic) to reach your registered EC2 instances in the backend
-   you must also ensure that the subnets' NACLs allow traffic to/from the ELB both ways (on the front and backend side)

on ELB we need to allow

-   **inbound**
    -   source: 0.0.0.0/0 (VPC CIDR for internal)
    -   protocol: TCP
    -   port: ELB listeners
-   **outbound**
    -   destination: EC2 sec. group
    -   protocol TCP, port: health check
    -   protocol TCP, port: listener

on EC2 instances we need to allow

-   **inbound**
    -   source: ELB sec. group
    -   protocol: TCP
    -   port: EC2 instance listeners and EC2 health checks
-   **outbound**
    -   destination: EBS sec. group
    -   protocol: TCP, port: ephemeral

### NACL

(assuming two subnets, one for ELB and one for EC2 instances)

-   ELB NACL

    -   **inbound to the ELB subnet**
        -   source: 0.0.0.0/0
        -   protocol: TCP
        -   port: ELB listeners
        -   **and**
        -   source: VPC CIDR
        -   protocol: TCP
        -   port: 1024-65535
        -   (return/response traffic from EC2 instances to ELB health checks/data)
    -   **outbound from the ELB subnet**
        -   (_to EC2_)
        -   destination: VPC CIDR
        -   protocol: TCP
        -   port: ELB listeners
        -   (_to EC2_)
        -   destination: VPC CIDR
        -   protocol: TCP
        -   port: health checks
        -   (_return traffic to interner_)
        -   destination: 0.0.0.0/0
        -   protocol: TCP
        -   port: 1024-65535

-   EC2 NACL

    -   **inbound to the EC2 subnet**
        -   source: VPC CIDR
        -   protocol: TCP
        -   port: listeners
        -   **and**
        -   source: VPC CIDR
        -   protocol: TCP
        -   port: health checks
        -   (_both the above are from the ELB_)
    -   **outbound from the EC2 subnet**
        -   destination: VPC CIDR
        -   protocol: TCP
        -   port: 1024-65535
        -   (_return/response to ELB_)
        -   **and any additional rules required for EC2 instance communication outbound aside from ELB**

-   these settings are needed if the ELB subnet is associated with a non-default NACL
    -   for default NACLs, everything is allowed inbound and outbound
-   the NACL settings focus primarily on ELB settings and response traffic
    -   you need to make sure that the EC2 instance subnet NACL has any additional rules required for any other inbound or outbound communication aside from the specified rules for ELB <-> EC2 communication
-   ELB subnet in this case is a public subnet
-   **for internal ELB**, replace the 0.0.0.0/0 in the NACL settings with VPC CIDR in all rules (inbound and outbound)
    -   ELB subnet is a private subnet in the Interbal ELB architecture

### session stickiness

-   whereby the ELB binds a client/user session/requests to a specific backend EC2 instance
-   it is not fault tolerant (in case the backend EC2 instance fails)
-   it requires SSL termination (SSL off-loading) on the ELB

    -   this in turn requires an X.509 (SSL server) certificate configured on the ELB

        -   you can upload the X.509 certificate if you have one using IAM, to be loaded on the ELB
        -   the X.509 certificate MUST be in the same AWS region as the ELB

-   the duration of the session stickiness is determined by either

    -   the application inserting session cookies, the case in which the ELB can be configured to follow the duration defined in the application's session cookies
    -   (ELB duration based stickiness) if the application does not have its own cookies, then the ELB can be configured to create one and determine the stickiness duration
        -   the ELB inserts a cookie in the response to bind subsequent requests from the user to the same backend instance
        -   the cookie helps the ELB identify which user/session should be sticky to which backend instance

-   **when using application cookie sessions**

    -   if the cookie expires, or is removed, the session is no longer a sticky session and ELB uses the normal, route to least loaded backend instance, until a new cookie is inserted

-   **for application cookie sticky sessions**

    -   if the cookie did not expire, but the backend instance becomes unhealthy, the ELB will route the traffic to a new, healthy, instance and keep the session stickiness

-   **for ELB, duration based, cookie stickiness**
    -   if the backend instance to which a session was sticky, fails or becomes unhealthy, the ELB routes the new session/requests (that were stuck before) to a new, healthy, instance and the session is no longer a sticky one

### SSL negotiation

-   elastic load balancing uses a secure socket layer (SSL) negotiation configuration, known as a security policy, to negotiate SSL connections between a client and the load balancer
-   the _security policy_ includes the encryption protocol version, ciphers to be used etc.
-   for front-end (client to ELB) [HTTPS/SSL]
    -   you can define your custom security policy or use the ELB pre-defined security policies
-   for backend, encrypted, connections

    -   pre-defined security policies are always used

-   **security policy components**

    -   SSL protocols
        -   SSL or TLS, are cryptographic protocols
        -   ELB supports
            -   TLS 1.0
            -   TLS 1.1
            -   TLS 1.2
            -   SSL 3.0
            -   **it does not support TLS 1.3 or 2.0**
    -   SSL Ciphers (a set of ciphers is called a cipher suite)
        -   encryption algorithms
        -   SSL can use different ciphers to encrypt data
    -   server order preference

        -   if enabled, the first match in the ELB cipher list with the client list is used
        -   by default, the default security policies have server order preference enabled

-   AWS ACM certificates includes an RSA public key
    -   if you want to use AWS ACM X.509 certificates, you need to include a set of ciphers that support RSA in your security policy, else, the TLS connection will fail
-   if you do not specify otherwise, AWS elastic load balancing service will configure your ELB with the current/latest pre-defined security policy
-   the ELB supports a single X.509 certificate
    -   for multiple SSL certificates, create multiple ELB instances
-   server side certificates are used to assure the client browsers of the server's identity (one way authentication); two way authentication can be used by leveraging both server and client side certificates
-   ELB does not support client side certificates with HTTPS (client side certificates are used to confirm the identity of the client - or a two way authentication)

-   ELB configured for TCP (layer 4) for front end and back end, does not change the headers and passes the traffic through to the EC2 instance
    -   for client side certificates use TCP on the ELB for both front end and back end, and enable proxy protocol, such that the EC2 instances will handle the authentication and SSL termination (**do not use HTTPS**)
        -   this will mean the ELB will not terminate the connection, and the termination/decryption will be on the EC2 backend instances themselves
        -   this also means the backed EC2 isntances MUST have a certificate
-   for end-to-end encryption, without decryption on the ELB, use TCP/SSL not HTTPS
    -   remember this will then not support Sticky Sessions since it requires HTTPS

### connection draining

-   it is disabled by default
-   when enabled, the ELB when identifying unhealthy instances, it will wait for a period of 300 seconds (by default), for in-flight sessions to the EC2 back end instance to complete
    -   if the in-flight sessions are not completed before the maximum time (300 seconds - configurable between 1 - 3600 seconds), the ELB will force termination of these sessions
    -   during the connection draining, the back end instance state will be _InService: Instance Deregistration Currently in Progress_
    -   AWS auto-scaling would also honor the connection draining setting for unhealthy instances
    -   during the connection draining period, ELB will NOT send new requests to the unhealthy instance

### monitoring

ELB monitoring can be achived by:

-   **AWS Cloud Watch**
    -   AWS ELB service sends ELB metrics to cloud wath every **one minute**
    -   ELB serive sends these metrics only if there are requests flowing through the ELB
    -   AWS Cloud watch can be used to trigger an SNS notification if a threshold you define is reached
-   **Access Logs**
    -   disabled by default
    -   you can obtain request information such as requester, time of request, requester IPm request type...
    -   optional (disabled by default), you can choose to store the access logs in an S3 bucket that you specify
    -   you are not charged extra for enabling access logs
        -   you pay for S3 storage
    -   you are not charged for data transfer of access logs from ELB to the S3 bucket
-   **AWS cloud trail**
    -   you can use it to capture all API calls for your ELB
    -   you can store these logs in an S3 bucket that you specify

### scaling

The time required for the ELB to detect the increase in traffic/load and scale (or add) more ELB nodes can take from 1 to 7 minutes according to traffic profile

-   ELB is not designed to queue requests
    -   it will return Error 503 (HTTP) if it can't handle the request, any request above the ELB capacity will fail
-   ELB service can scale and keep up with traffic increase, if your traffic increases at 50% in step or linear form every 5 minutes
-   solution to this is **ELB pre-warming** - contact the AWS

-   when the ELB scales (spins more ELB nodes with new public IP addresses)

    -   it updates the ELB's DNS record with the new list of ELB node public IP addresses (for internet facing ELB)
    -   ELB uses a DNS record TTL of 60 seconds, to ensure that the new ELB node IP addresses are used and allow clients to take advantage of the increased capacity

-   for efficient load testing of your ELB or applications hosted on backed instances

    -   use multiple testing instances of client testing and try to launch the tests at the same time
        -   you can also use global testing sites if possible
    -   **if using a single client for testing**, ensure your testing tool will enforce the **re-resolving of DNS** with each testing/request initiated for testing
        -   this will ensure that as ELB service launches new ELB nodes, the new nodes will be leveraged through DNS re-resolution

-   by default, ELB has an idle connection timeout of 60 seconds
    -   set the idle timeout of your applications (those launched on registered EC2 instances) to at least 60 seconds
        -   if you set it below 60 seconds, the ELB may consider your instance unhealthy if it keeps closing connections frequently, and stop routing traffic to it
