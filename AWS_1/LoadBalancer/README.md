-   [Load Balancer](#load-balancer)
    -   [Classic Load Balancer](#classic-load-balancer)
        -   [Listeners](#listeners)
        -   [Health Checks](#health-checks)
        -   [Cross Zone load balancing](#cross-zone-load-balancing)

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
-   you can startto be charged hourly (also for partial hours) once your ELB is active

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
