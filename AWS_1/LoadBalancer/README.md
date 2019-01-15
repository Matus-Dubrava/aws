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
    -   [Application Load Balancer](#application-load-balancer)
        -   [ALB listeners](#alb-listeners)
        -   [ALB target groups](#alb-target-groups)
        -   [ALB targets](#alb-targets)
        -   [ALB rules](#alb-rules)
        -   [ALB content based routing](#alb-content-based-routing)
        -   [ALB containers](#alb-containers)
        -   [ALB vs CLB](#alb-vs-clb)
        -   [ALB monitoring](#alb-monitoring)
        -   [migration from CLB to ALB](#migration-from-clb-to-alb)

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

## Application Load Balancer

-   **CLB and ECS**

    -   and ECS service is the AWS ECS entity which allows to run and maintain a specified number (the _desired count_) of instances of a task definition simultaneously in an ECS cluster

    -   the ECS service

        -   ECS service scheduler, if any of your tasks should fail or stop for any reason, will launch another instance of your task definition to replace it and maintan the desired count of tasks in the service
        -   optionally, an ECS service can run behind a load balancer
            -   the load balancer dsitributes traffic across the tasks that are associated with the service

    -   there is a limit of one load balancer or targer group per service

    -   all ot the containers that are launched in a single task definition are always placed on the same container (EC2) instance
    -   you may choose to put multiple containers (in the same task definition, hence in the same task when instantiated) behind the same **CLB**

        -   **you do this by**, defining multiple host ports in the service definition (container ports when configuring the task definition)
        -   you can define these listener ports as listeners on the CLB
        -   for example, if a task definition consists of application service using port 3000 on the container instance, with another application service using port 4000 on the container instance, the same load balancer can route traffic to both through two listeners

    -   currently, an ECS service can only specify a single load balancer
        -   i.e you can not use more than one ELB per service
    -   if your task and container definition require multiple ports per container

        -   then your service require access to multiple load balanced ports to serve the task containers (for example, port 80 and port 443 for an HTTP/HTTPS service)
        -   then, you must use a **CLB with multiple listeners** if you can not change the service/task definitions; **ALB can't do this**

    -   AWS does not recommend connecting multiple services to the same CLB
    -   if/when you do so, entire container instances are reregistered and deregistered with CLB (and not host and port combinations)
        -   this configuration can cause issues if a task from one service stops, causing the entire container instance to be deregistered from the CLB
            -   this will impact other task(s) from a different service on the same container instance that is sill using it
            -   so different services would dictate different CLBs (higher costs and more configuration)

-   **ALB**
    -   serves as the single point of contact for clients, the load balancer distributes incoming application traffic across multiple targets, such as EC2 instances, in multiple AZs
    -   this increases the availability of your application; you add one or more listeners to your load balancer
    -   ALB functions at the application layer, the 7 layer of the ISO OSI model
        -   it supports HTTP, HTTPS, HTTP/2, and websockets
    -   **components**
        -   ALB
        -   listeners
        -   target groups
        -   targets
        -   rules (condition, action, priority)

### ALB listeners

-   listeners difne the protocol/port combination that the ALB will listen on for incoming requests
-   a listener checks for connection requests from clients using the protocol and port that you configure, and forwards requests to one or more **target groups**, based on the rules that you define
-   each ALB requires at leas one listener to accept traffic
-   supported protocols: HTTP/HTTPS
    -   ports: 1 - 65535

### ALB target groups

-   are regional constructs (confined to a region)
-   a target group is a logical grouping of targets
-   note that each target group can be associated with **only one load balancer**
-   as groups can sale each target group individually
-   the **target group** is used to route requests to registered **targets** as part of an action for a rule
-   target groups specify a protocol and a target port
-   health checks can be configured per target group
-   ALB can route to muliple target groups
-   you define **one protocol and one port per target group** which will be used to route/forward traffic to the registered targets
-   they can exist independently from ALB

### ALB targets

-   **targets** specify the endpoint and are registered with the ALB as part of a target group
-   targets can be EC2 instances, a microservice, and application on an ECS container, or IP addresses
    -   you can't specify public internet-routable IP addresses as targets
-   an EC2 instance can be registered with the same target group multiple times using multiple ports
-   up to 1000 targets can be contained within a target group
-   you can register a target with multiple target groups
-   you can add and remove targets from your load balancer as your needs change, without disrupting the overall flow of requests to your application (connection draining timeout)

-   you can use IP addresses as targets to register
    -   instances in a peered VPC
    -   AWS resources that are addressable by IP addresses and port (for example, databases)
    -   on-premises resources linked to AWS through AWS direct connect or a VPN connection
-   you can register each EC2 instance or IP address with the same target group multiple times using different ports, which enables the load balancer to route requests to microservices
-   if you specify targets using an instance ID, traffic is routed to instances using the primary ENI and the primary IP address specified on that ENI
-   you can specify targets using IP addresses, you can route traffic to an instance using any private IP address from one or more network interfaces

    -   this enables multiple applications on an instance to use the same port

-   you **CAN NOT** mix targets of different types in one target group, i.e you can not mix EC2 instances with ECS and/or IP targets in one traget group
    -   you need to keep the endpoint type homogenous in each group
-   IP targets are targets within the VPC or on-premise accessible through VPN or DX
    -   they cannot be public, internet-routable, IP addresses
-   you can configure health checks on a per target group basis
    -   health checks are performed on all targets registered to a target group that is specified in a listener rule for your load balancer
-   by default, the load balancer sends requestts to registered targets using the port and protocol that you specified for the target group

    -   you can override this port when you register each target with the target group

-   you can delete a target group if it is not referenced by any action
-   deleting a target group does not affect the targets registered with the target grop; if you no longet need a registered EC2 instance, you can stop or terminate it

### ALB rules

-   **rules provide a link between listeners and target groups** and consists of conditions and actions

    -   up to 100 rules can be configured per ALB
    -   **rules** determine what action is taken when a rule matches a client request
    -   rules are defined on listeners
    -   each rule consists of a prioerity, action, optional host condition, and optional path condition
    -   each rule specifies a (optional) **condition**, **target group**, **action**, and a **priority**
        -   when the condition is met, the traffic is forwarded to the target group
    -   each rule represents a condition and action that we want to follow
    -   you must define a default rule for each listener, and you can add rules that specify different target groups based on the content of the request (**also known as content-based routing)**
    -   if no rules are found, the request will follow the defatul rule, which forwards the request to the default target group

-   **rule priority**

    -   each rule has a priority
    -   rules are evaluated in priority order, from the lowest value to the highest value
    -   the default rule is evaluated last
    -   you can change the priority of a nondefault rule at any time
    -   you cannot change the priority of the default rule

-   **rule actions**

    -   each rule action has a type and a target group
    -   currently, the only supported type is forward, which forwards requests to the target group
    -   you can change the target group for a rule at any time

-   **listener rules**

    -   each listener has a default rule, and you can optionally define additional rules
    -   each rule consists of a priority, action, optional host condition, and optional path condition

-   **default rules**

    -   when you create a listener, you define an action for the defaul rule
    -   default rules can't have conditions
    -   you can delete the non-default rules for a listener at any time; you cannot delete the default rule for a listener; when you delete a listener, all its rules are deleted
    -   if no conditions for any of a listener's rules are met, then the action for the default rule is taken

-   **rule conditions**

    -   there are two types of rule conditions: host and path; when the conditions for a rule are met, then its action is taken
    -   each rule can have up to 2 conditions, 1 path condition and 1 host condition
    -   (optional) **condition** is the path pattern you want the ALB to evaluate in order for it to route requests

-   **request routing**
    -   after the load balancer receives a request, it evaluates the listener rule **in priority order** to determine which rule to apply, and then selects a target from the target group for the rule action **using the round robin routing algorithm**
    -   your load balancer routes requests to the targets in the target group using the protocl and port that you specify when configuring routing, and performs health checks on the targets using these health check settings
    -   routing is performed independently for each target group, even when a target is registered with multiple target groups
    -   note that you can configure rules to route requests to different target groups based on the content of the application traffic

### ALB content based routing

-   **content-based routing**

    -   if your application is composed of several individual services, an ALB can route a request to a service based on the content of the request
    -   two types of content routing are supported on the ALB, then are host-based and path-based

-   **host-based (domain name routing)**

    -   you can create ALB rules to route a client request based on the domain name host field of the HTTP header allowing you to route to multiple domains from the same load balancer
    -   HTTP request - host field:
        -   specifies the domain name of the server (for virtual hosting), and (optionally) the TCP port number on which the server is listening
        -   requests to _blog.example.com_ can be sent to a target groupm while requests to _content.example.com_ are sent to another

-   **using path-based routing** you can route a client request based on the URL path of the HTTP header
    -   it routes incoming HTTP and HTTPS traffic based on the path element of the URL in the request
    -   this path-based routing allows you to route requests to, for example, **/images** to one target group, and **/video** to another target group
    -   segmenting your traffic in this way gives you the ability to control the processing environments for each category of requests
        -   perhaps **/images** requests are best processed on a specific type of EC2 instances, while **/videos** requests are best handled by graphic optimized instances
    -   you can also create rules that combine host-based routing and path-based routing
        -   this would allow you to route requests to **images.example.com/thumbnails** and **images.example.com/production** to distinct target groups
    -   anything that does not match content routing rules (by way of a defaul rule) can be sent to a default target group

### ALB containers

-   **microservices as target groups with your ALB**

    -   you can use a micro-services architecture to struture your application as services that you can develop and deploy independently
    -   you can install one or more of these services on each EC2 instance, with each service accepting connections on a different port
    -   you can use a single ALB to route requests to all the services for your application
    -   when you register an EC2 instance with a target group, you can registr it multiple times
        -   for each service, register the instance using the port for the service

-   **and ECS service is**

    -   a service allows you to run and maintain a specified number (the _desired count_) of simultaneous instances of a task definition in an ECS cluster
        -   underneath which we define the desired number of tasks to be run

-   **service load balancing**

    -   your ECS service can optionally be configured to use load balancing to distribute traffic evenly across the tasks in your service
    -   ALB offers several features that make them particularly attractive for use with ECS services

        -   ALB allows containers to use dynamic host port mapping (so that multiple tasks from the same service are allowed per container instace)

    -   ALB supports path-based routing and priority rules (so that multiple services can use the same listener port on a single APLB)
    -   the ALB also integrates with ECS using Service load balancing

        -   instance can be registered with multiple ports
            -   this allows for requests to be routed to multiple containers on a single container instance
        -   ECS will automatically register tasks with the ALB using a dynamic container-to-host port mapping
            -   this allows for dynamic mapping of services to ports as specified in the ECS task definition
        -   the ECS task scheduler will automatically add these tasks to the ALB

    -   currently, ECS service can only specify a single load balancer or target group
    -   if your task and container definition require multiple ports per container, then your service requires access to multiple load balanced ports to serve the task containers (for example, poer 80 and port 443 for an HTTP/HTTPs service), the following explains how you can do it to use an ALB and achieve this instead of using a CLB
    -   to use an ALB, and since each target group supports only one forwarding ports, you will need to separate the single HTTP/HTTPS service into two services (with two, one container per port, task definitions)
        -   one service will have a single container port task definition for HTTP port 80
        -   the other will have a single container port task definition to handle HTTPS port 443
        -   define two target groups on the same ALB, one for HTTP port 80, and another for HTTPS port 443; each service will leverage one of the target groups

-   ALB offers several features that make them particularly attractive for use with ECS services

    -   ALB allows containers to use dynamic host port mapping
        -   such that multiple tasks (using the same port) from the same service are allowed per containers instance
        -   you can use dynamic port mapping to support multiple tasks from a sigle service on the same container instance
    -   ALB supports path-based routing and priority ryles, such that multiple services can use the same listener port on a single ALB

-   in dynamic port mapping, ECS manages updates to your services by automatically registering and deregistering containers with the ALB using the instance ID and port for each container

-   ALB makes routing decisions at the application layer (HTTP/HTTPS), supports path-based routing, and can route requests to one or more ports on each container instance in your cluster
-   **ALB supports dynamic host port mapping**
-   if your task's container definition specifies port 80 for a container port, and port 0 for the host port, then the host port is dynamically chosen from the ephemeral port range of the container instance (such as 32768 to 61000 on the latest Amazon ECS-optimized AMI)

-   when the task is launched, the container is registered with the ALB as an instance ID and port combination, and traffic is distributed (by the ALB) to the instance ID and port corresponding to that container
-   this dynamic mapping allows you to have multiple tasks from a single service on the same container isntance

### ALB vs CLB

-   WebSockets protocol support

    -   ALB provide native support for websockets
    -   you can use websockets with both HTTP and HTTPS listeners
    -   websockets allow for full duplex communication
    -   websockets protocol support is enabled by default
    -   **CLB does not support it**

-   **HTTP/2 support**

    -   HTTP/2 allows multiple requests at the same time
    -   HTTP/2 is supported by default

-   ALB provide native support for HTTP/2 with HTTPS listeners

    -   you can send up to 128 requests in paralled using one HTTP/2 connection
    -   the load balancer converts those to individual HTTP/1.1 requests and distributes them across the healthy targets in the target group using the round robin routing algorithm

-   supports enhanced health checks and enhanced CloudWatch metrics
-   ALB provides health check imporvements that allow detailed error codes from 200-399 to be configured
-   ALB provides additional information an access logs compared to CLB

-   **ALB also supports WAF**

    -   you can use AWS WAF with your ALB to allow or block requests based on the rules in a web access control list (web ACL)

-   internet facing ALB supports IPv4 and DualStack

    -   however, the ALB will communicate with the targets using IPv4

-   internal ALB uses IPv4 only (no dual stack support yet)

-   **ALB does not support backend server authentication**

    -   backend server authentication enables authentication of the instances
    -   load balancer communicates with an instance only if the public key that the instance presents to the load balancer matches a public key in the authentication policy for the load balancer
    -   **CLB does**

-   **ALB does not support EC2 classic**

-   **delete protection**

    -   to prevent your load balancer from being deleted accidentally, you can enable delete protection; by default, delete protection is disabled for your load balancer
    -   if you enable delete protection for your load balancer, you must disable it before you can delete the load balancer
    -   as soon as your load balancer becomes available, you are billed for each hour or partial hour that you keep it running
    -   when you no longer need the load balancer, you can delete it
        -   as soon as the load balancer is deleted, you stop incurring charges for it
    -   you can't delete a load balander if the deletion protection is enabled
    -   deleting a load balancer does not affect its registered targets
        -   your EC2 instances continue to run and are still registered to their target groups

-   **SNI**

    -   you can serve multiple TLS secured applications (multiple domains) by the ALB, each with its own certificate
    -   you can bind multiple certificates to the same secure listener of the ALB
    -   integrates with AWS ACM
    -   ALB will choose the right certificates depending on the client request
    -   SNI is an extension to the TLS protocol by which a client indicates the hostname to connect to at the start of the TLS handshake
    -   the load balancer can present multiple certificates through the same secure listener, which enables it to support multiple secure websites using a single secure listener
    -   ALB also support a smart certificate selection algorithm with SNI

-   **connection idle timeout (default 60 seconds)**

    -   for each request that a client makes through a load balancer, the load balancer maintains two connections
        -   a front-end connection is between a client and the load balancer
        -   and a back-end connection is between the load balancer and a target
    -   for each front-end connection, the load balancer manages an idle timeout that is triggered when no data is sent over the connection for a specified time period
        -   if no data has been sent or received by the time that the idle timeout period elapses, the load balancer closes the front-end connection
    -   for back-end connection, AWS recommends that you enable the HTTP keep-alive option for your EC2 instances
        -   you can enable HTTP keep-alive in the web server settings for your EC2 instances
        -   if you enabled, the ALB can reuse back-end connections until the keep-alive timeout expires

-   **deregistration delay**

    -   ELB stops sending requests to targets that are deregistering
    -   by default, ELB waits 300 seconds before completing the deregistration process which can help in-flight requests to the target to complete
    -   to change the amount of time that ELB waits, update the deregistration delay value
        -   note that you can specify a value of up to 1 hour, and that ELB waits the full amount of time specified, regardless of whether there are in-flight requests

-   **sticky sessions**

    -   to use sticky sessions, the clients must support cookies
    -   ALB support load balancer-generated cookies only
        -   the name of the cookie is AWSALB
        -   the contents of these cookies are encrypted using a rotating key
        -   you cannot decrypt or modify load balancer-generated cookies
    -   Websockets connections are inherently sticky
        -   after the websockets upgrade is complete, cookie-based stickiness is not used
    -   you enable sticky sessions at the target group level
        -   you can also set the duration for the stickiness of the load balancer-generated cookie, in seconds. The duration is set with each request

-   **health checks for target groups**

    -   each load balancer node routes requests only to the healthy targets in the enabled AZs for the load balancer
    -   each load balancer node checks the health of each target, using the health check settings for the target group with which the target is registered
    -   after your target is registered, it must pass one health check to be considered healthy
    -   after each health check is completed, the load balancer node closes the connection that was established for the health check
    -   **(fail open) if no AZ contains a healthy targetm the load balancer nodes route requests to all targets**
    -   note that health checks do not support websockets

-   **health checks reason codes**
    -   if the status of a target is any value other than healthy, the API returns a reason code and a description of the issue, and the console displays the same description in a tooltip

### ALB monitoring

-   ELB reports metrics to CloudWatch only when requests are flowing though the load balancer
-   **if there are requests flowing through the load balancer**, ELB measures and sends its **metrics in 60-second intervals**
-   if there are no requests flowing through the load balancer or no data for a metric, the metric is not reported

-   **request tracing for ALB**
    -   you can use request tracing to track HTTP requests from clients to targets or other services
    -   when the load balancer receives a request from a client, it adds or updates the **X-Amzn-Trace_Id** header before sending the request to the target
    -   any services or applications between the load balancer and the target can also add or update this header
    -   if you enable access logs, the contents of the **X-Amzn-Trace-Id** header are logged

### migration from CLB to ALB

-   support for registering targets by IP address, including targets outside the VPC for the load balancer
-   support for containerized applications
    -   ECS can select an unused port when scheduling a task and register the task with a target group using this port
    -   this enables you to make efficient use of your clusters
-   support for monitoring the health of each service independenly, as health checks are defined at the target group level and many CloudWatch metrics are reported at the target group level
-   attaching a **target group to an auto scaling group** enables you to scale each service dynamically based on demand; this is valid only for target groups with EC2 instances asa targets (not IP address)
