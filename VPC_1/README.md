-   [VPC](#vpc)
    -   [Types](#types)
-   [Components](#components)
    -   [Implied Router](#implied-router)
    -   [Route Tables](#route-tables)
    -   [VPC IP Addressing](#vpc-ip-addressing)
        -   [AWS Reserved IPs in each subnet](#aws-reserved-ips-in-each-subnet)
    -   [Internet Gateway](#internet-gateway)
    -   [Security Groups](#security-groups)
    -   [Network Access Control Lists](#network-access-control-lists)
    -   [TCP IP packet headers](#tcp-ip-packet-headers)
    -   [NAT instance](#nat-instance)
-   [Peering](#peering)
-   [VPN](#vpn)
    -   [CloudHub](#cloudhub)
-   [Direct Connect](#direct-connect)
-   [VPC Endpoints](#vpc-endpoints)
    -   [Interface Endpoints](#interface-endpoints)
    -   [Gateway Endpoint](#gateway-endpoint)
-   [Flow Logs](#flow-logs)
-   [DHCP](#dhcp)

# VPC

-   is a virtual network or data center inside of AWS for one client, or a department in an enterprise
-   the aws client has full control over resources and virtual compute instances (virtual servers) hosted inside that VPC
-   is similar to having your own data center inside AWS
-   logically isolated from other VPCs on AWS
-   you can have one or more IP address subnets inside a VPC

VPC can span only one region (we can **NOT** have one VPC that spans serveral regions), but we can connect them via VPC peering.

We can have multiple subnets inside of one VPC, and one subnet can span only one Availability Zone (we can **NOT** have one subnet stretched across two or more AZs), but we can have multiple subnets inside of one AZ. Similarly, we can have more VPC inside on a single region (but there is a limit of 5 VPC per region per account).

## Types

-   **default VPC**
    -   created in each region when an AWS account is created
    -   has default CIDR, Security Group, NACL, and route table settings
    -   has an Internet Gateway by default
-   **custom (non-default) VPC**
    -   is a VPC an AWS account owner creates
    -   AWS user creating the custom VPC can decide the CIDR
    -   has its own default security group, NACL, and route table
    -   does **NOT** have an Internet Gateway by default, one needs to be created if needed

**AWS supports IPv6** but all IPv6 are **PUBLIC**. Hence, AWS allocates IPv6 address range only if you require that.

# Components

-   CIDR and IP address subnets
-   implied router
    -   once we create VPC, we will automatically get access to router
-   route tables - we can create separate route tables for each subnet, and here we are specifying where to send which traffic
-   security groups - last line of defense, they operate on NIC (network interface connection), and we can specify security group for each NIC separatelly
-   network access control lists (NACLs) - first line of defense, they operate on subnet level and we can have one NACL per subnet
-   internet gateway - we need one to connect our VPC to the Internet, this is a managed service, and we can have only one per VPC
-   virtual private gateway - similarl to internet gateway, it serves to connect our on premise hardware datacenter to our AWS VPC, either via internet over VPsec or via Direct Connect

## Implied Router

-   it is the central VPC routing functions
-   it connects the different AZ's together and connects the VPC to the Internet Gateway or VPC endpoints or Virtual Private Gateway
-   each subnet will have a route table that router uses to forward traffic within VPC
-   the route tables will also have entries to external destinations

-   you can have up to 200 route tables per VPC
-   you can have up to 50 routes entries per route table
-   each subnet **MUST** be associated with only one route table at any given time
    -   one route table **CAN** be associated with multiple subnets
-   if you do not specify a subnet-to-route-table association, the subnet (when created) will be associated with the main (default) VPC route table

## Route Tables

-   you can change the subnet association to another route table
-   you can also edit the main (default) route table if you need, but you **CANNOT** delete the Main (default) route table
    -   however, you can make a custom route table manually become the main route table, then you can delete the former main, as it is no longer the main route table (main route table = flag)
-   every route table in a VPC comes with a default rule that allows all VPC subnets to communicate with one another

    -   you **CANNOT** modify or delete this rule

    **IMPORTANT**: if you have multiple subnets inside of the VPC and instances in each subnet which, for whatever reason can't communicate between each other, or just one to another, routing will **NEVER** be the issue (updating route table will not help, by default, instances inside of one VPC can communicate with each other and this can't be prevented via routing)

## VPC IP Addressing

-   once the VPC is created, you can **NOT** change its CIDR block range
    -   however, you can expand your VPC CIDR by adding new/extra IP address ranges, but there are limitations to what additional CIDR ranges we can attach to our existing VPC
    -   minimum range is _/28_, and the maximum is _/16_
-   if you need a different size, create a new VPC

### AWS Reserved IPs in each subnet

-   first 4 IP addresses in each subnet and the last one are reserved by AWS
    -   ex. if the subnet is 10.0.0.0/24
        -   10.0.0.0 is the base network
        -   10.0.0.1 VPC router
        -   10.0.0.2 DNS related
        -   10.0.0.3 reserved for future
        -   10.0.0.255 last IP
    -   ex. 10.0.0.0/25
        -   10.0.0.0
        -   10.0.0.1
        -   10.0.0.2
        -   10.0.0.3
        -   10.0.0.127 (32bits - 25bits = 7bits => 2^7 = 128 => 0 .. 127)

## Internet Gateway

-   is the gateway through which your VPC communicates with the internet, and with other AWS services
    -   you can **NOT** have more than one IGW per VPC, and you can't scale it
-   it is fully managed, horizontally scaled, redundant, and highly available VPC component
-   it performs NAT (static one-to-one) between your private and public (or elastic) IPv4 addresses
    -   public address of your instances is stored in IGW, and IGW performs this translation public to private and vice versa
-   it supports both IPv4 and IPv6

## Security Groups

-   a security group is a virtual firewall
-   it controls traffic at the virtual server (EC2 instance) level
    -   specifically at the virtual network interface (ENI - Elastic Network Interface)
-   up to 5 security groups per EC2 instance interface (ENI) can be applied
-   **stateful**, return traffic of allowed inbound traffic, is allowed, even if there are no rules to allow it
    -   eg. instance A allows outbound ping -> pings B -> B allows inboud ping
        -   it is guaranteed that the ping will come back to A, even if B doesn't allow outbound ping and A doesn't allow inbound ping
        -   A has generated that request therefore it automatically allows for the response to pass in
        -   B has allowed ping request to pass in, therefore it automatically allows itself to respond to that ping
        -   _B needs to allow echo request on inbound and A needs to allow echo request on outbound_
-   **can only** have permit rules, can **NOT** have deny rules
-   there is implicit deny rule at the end
-   security groups are associated with EC2 instance's network interface
-   all rules are evaluated to find a permit rule for given traffic, if there is no such rule, traffic is blocked

-   each VPC created will have a default Security Group created for it, you can **NOT** delete a default Security Group
-   security groups are VPC resources, hence, different EC2 instances, in different AZs, belonging to the same VPC, can have the same security group applied to them
-   **changes to security groups take effect immediately**

-   default security group in a default or custrom VPC, will have

    -   inbound rules to allow instances assigned the same security group to talk to one another
    -   all outbound traffic is allowed
    -   **inbound**
    -   _source | protocol | port_
    -   _def-sg-id | all | all | allow_
    -   **outbound**
    -   _destination | protocol | port_
    -   _all | all | all | allow_

-   custom (non-default) security groups in a VPC will always have

    -   **No** inbound rules - basically all inbound traffic is denied by default
    -   all outbound trafiic is allowed by default

-   you can use securoty group names as the source or destination in other security group rules
-   you can use the security group name as the source in its own inbound security group rules
-   security groups are directional and can use allow rules only
-   a security group set of rules ends with an implicit deny any

-   to allow the EC2 instances assigned to a security group to communicate with one another

    -   create a security group, apply it to all these instances, and configure a rule that allows any traffic, on any protocol/ports, the source of which is the security group itself
    -   be cautious that the security group is a VPC resource, which means that member EC2 instances can be from different subnets and AZs too (but **NOT** from different VPCs)

-   to allow all EC2 instances on a subnet to communicate with each other
    -   create a security group and apply it to those instances, and configure a rule that allows communication on all protocols/ports, the source of which is the subnet CIDR block

## Network Access Control Lists

-   it is a function performed on the implied router (the implied VPC router hosts the Network ACL function)
-   if functions at the subnet level
-   NACLs are **stateless** - outbound traffic for an allowed inbound traffic must be **explicitely** allowed too
-   you can have _permit_ and _deny_ rules in a NACL
-   NACL is an ordered set of rules where each rule has a number => first match is resolved

-   NACL rules are checked for a _permit_ from lower numbered rules until either a permit rule is found, or an explicit/implicit _deny_ is reached
-   you can insert rules (based on the configured rule number spacing) between existing rules, hence, it is recommended to leave a number range between any two rules to allow for edits later
-   NACLs end with an **explicit** deny any, which you can **NOT** delete
-   a subnet must be associated with a NACL, if you do not specify the NACL, the subnet will get associated with the default NACL automatically

-   you can create your own custom NACL, you do not have to use the default one
-   a default NACL allows all traffic inbound and outbound (not very good from security perspective, can be changed)
-   a custom (non-default) NACL **blocks/denies** all traffic inbound and outbound by default (this of course can be changed)

-   if an instance in a VPC is unable to communicate over a certain protocol/port with another instance in the same VPC, then the problem is the security setting of:
    -   security group or NACL of the source instance and/or
    -   security groupd or NACL of the destination instance
        -   **the problem will never be routing table configuration, due to the default route entry**
-   remember that NACLs are **stateless**, to allow certain traffic through it, it needs to be allowed (and the return traffic) in the inbound and outbound rules of the NACL

**example**
We have two different subnets within the same VPC, there is an instance A, with security group A in the subnet A which has NACL A. The same goes for instance and subnet B. Now, instance A tries to ping instance B but it is unable to do so, what might be the issue?

-   issue can be
    -   outbound rules in security group A
    -   inbound rules in security group B
    -   NACL A inbound rules
    -   NACL A outbound rules
    -   NACL B inbound rules
    -   NACL B outbound rules
-   issue can **NOT** be
    -   routing table (there is that default entry that will always allow this)
    -   inbound rules in security group A (security groups are statefull, A initiated the traffic, assuming that the traffic went through its outbound rules, resonse **WILL** be allowed)
    -   outbound rules in security group B (same reasoning as above, just from the opposite direction)

The same scenario. Allow ping from A to B.

-   need to configure
    -   outbound SG on A
    -   inbound SG on B
    -   inbound/outbound NACL A
    -   inbound/outbound NACL B

Allow ping from B to A.

-   need to configure
    -   outbound SG on A
    -   inbound SG on B
    -   inbound/outbound NACL A
    -   inbound/outbound NACL B

Any instance inside of subnet A to communicate with any instance inside of subnet B. Assume NACLs are configured.

-   need to configure
    -   outbound SG on A with destination - SG B
    -   inbound SG on B with source - SG A

**remember**

-   inbound in ACL means comming from outside the subnet destined to the subnet. Outbound means going out of the subnet.
-   inbound for security groups means inbound from outside of the instance destined to the instance. Outbound means going out of the instance's ENI

-   NACL is the subnet guard and the first line of defense
-   Security Group is the instance guard and the second line of defense (defense in depth)
-   they both work together to secure your hosted environment
-   it is also highly recommended to use your own application security means (firewalling) to add a deeper layer to your application security

-   changes made to NACLs and security groups take effect **immediatelly**, so they are both quick to activate/defend as needed
-   NACLs can help you block certain ranges of IP addresses from a large pool (internet addresses for instance), because they do have deny rules
    -   **security groups can NOT block a certain range of IP addresses from internet from getting to your EC2 fleet of instances**

## TCP IP packet headers

![TCPIP](https://github.com/Matus-Dubrava/aws/blob/master/VPC_1/TCPIP.png)

The important takeaway from the above picture is the _ephemeral ports_. While the client is requesting webpage through HTTP protocol which operates on port 80, it doesn't mean that the source port is 80!

Usually, the source port will be some ephemeral port from the range of 1028-65535 range, and since that is the source port, we need to return that traffic to the same port.

The same goes for our own resources inside of our VPN. When webserver is trying to reach DB on port 3306, the source port is, again, some ephemeral port to which we need to return the traffic to.

This needs to be taken into consideration when designing Security Groups and NACLs.

## NAT instance

-   NAT instance is configured in a **public subnet**, it needs to have route to the Internet in order to perform its supposed role
-   NAT instance needs to be assigned a security group
-   NAT instance is there to enable the private subnet EC2 instances to get to the interned (you might want to patch your private BD server)
-   no traffic initiated from the Internet can access the private subnet
-   only admin SSH traffi can be allowed to the NAT instance (or RDP in case of Windows)
-   public subnets' EC2 instances don't need to go through NAT (they already have access to the Internet)
-   NAT instances needs to have either public IP or elastic IP

-   **Source/Destination check parameter on NAT instance need to be disabled**
    -   enabled by default
    -   what it does is that instances with this check enabled will not process traffic that only flows through them
    -   if the traffic is comming to the instance but the destination is sometthig else than this instance, then it will not be handled
    -   generally you want this feature enabled
    -   but NAT instances needs to process this kind of traffic so you need to disable this check

### NAT instance Security Group

-   private subnet EC2 instances need to access websites on the Internet (HTTP or HTTPS) and admin needs to be able to access private instances via SSH

-   NAT instances' security group must allow
    -   traffic inbound from private subnet or the private subnet's security group as a SOURCE on ports 80 (HTTP) and 443 (HTTPS)
    -   traffic outbound to 0.0.0.0/0 (Internet) on ports 80 and 443
    -   traffic inbound from the customer's (admin's) own network on port 22 (SSH) to administer the NAT instance (RDP in case of Windows)

# Peering

-   a VPC peering connection is a networking connection between two VPCs that enables you to route traffic between them using private IPv4 addresses or IPv6 addresses
-   instances in either VPC can communicate with each other as if they are within the same network
-   you can create a VPC peering connection between your own VPCs, or with a VPC in another AWS account within a single region or between regions (Inter-region VPC peering - traffic travels encrypted through AWS backbone nework)

-   AWS uses the existing infrastructure of a VPC to create a VPC peering connection; it is neither a gateway nor a VPC connection, and does not rely on a separate piece of physical hardware
-   there is no single point of failure for communication or a bandwidth bottleneck
-   examples of VPC peering connection usage:
    -   if you have more than one AWS account, you can peer the VPCs across those accounts to create a file sharing network
    -   you can also use a VPC peering connection to allow other VPCs to access resources you have in one of your VPCs

To establish a VPC peering connection, you do the following:

-   the owner of the _requester VPC (or local VPC)_ sends a request to the owner of the peer VPC to create the VPC peering connection. The peer VPC can be owned by you, or another AWS account, and cannot have a CIDR block that overlaps with the requester VPC's CIDR block
-   the owner of the peer VPC accepts the VPC peering connection request to activate the VPC peering connection
-   to enable the flow of traffic between the peer VPCs using private IP addresses, add route to one or more of your VPC's route tables that points to the IP address range of the peer VPC. The owner of the peer VPC adds a route to one of their VPC route tables that points to the IP address range of your VPC.

-   if required, update the security group rules that are associated with your instances to ensure that traffic to and from the peer VPC is not restricted

    -   you can reference Security Group from the peered VPC, but only in case of inter-region peering (you can **NOT** reference security group of the other VPC when using **inter-region** peering)

-   VPC peering connection is a one to one relationship between two VPCs. You can create multiple VPC peering connections for each VPC that you own.
-   transitive peering relationships (edge-to-edge routing) are not supported: you do not have any peering relationship with VPCs that your VPC is not direcly peered with

-   a _placement group_ can span peered VPCs

**limitations**

-   you cannot create a VPC peering connection between VPCs that have matching or overlaping IPv4 or IPv6 CIDR blocks
-   you have a limit on the number of active (50) and pending (25) peering connections that you can have per VPC
-   VPC peering does not support transitive peering relationships; in a VPC peering connection, your VPC does not have access to any other VPCs that the peer VPC may be peered with
-   you cannot have more than one VPC peering connection beweeen the same two VPCs at the same time
-   unicast reverse path forwarding in VPC peering connections is not supported

# VPN

-   VPN connections are quick, easy to deploy, and cost effective
    -   no dedicated cables are needed to be established, connection is established via Internet over IPsec
    -   this also means that there is no guaranteed performance, latency can be good as well as bad
-   a VGW (virtual gateway) is required on the VPC side, and a Customer gateway on the client's data center (locations) side
-   an Internet routable IP address is required on your Customer gateway
-   two tunnels are configured for each VPN connection for redunancy
-   you can **NOT** use the NAT gateway in your VPC through the VPC connection

    -   custormer can **NOT** go from their datacenter/office through the VPN/Direct Connect to AWS and then through NAT to Internet

-   you need to update your vpn-only subnets' route table(s) to point at the VGW for subnets that are on the other side of the VPN connection
    -   this can be done via _route propagation_ - your VGW and the customer Gateway will exchange information with their routers about each others subnets (this can also be done by manually updating route tables)

Which IP prefixes can receive/send traffic through the VPN connection?

-   only IP prefixes that are known to the VGW
-   VGW learns about these prefixes through Static or BGP routing
-   VGW does not route any other traffic destined outside of the received BGP advertisements, static route entries, or its attached VPC CIDR
-   you can **NOT** access Elastic IPs on your VPC side using the VPN tunnel established, Elastic IPs in AWS can only be accessed from the Internet

## CloudHub

-   you can have up to 10 IPSec connections per VGW (soft limit can increased by contacting AWS)
-   VPN based Hub and Spoke connectivity to a common VGW
-   can mix _Direct Connect (DX)_ connections, with VPN connection
-   customers datacenters/offices (branches) connected within the same Hub **CAN** talk to each other via VGW
    -   this can be a redundant connectivity for the branch offices to the main office or data center too
-   IPSec VPN tunnels + BGP (Border Gateway Protocol) need to be used
-   you are charged hourly VPN rates plus data transfer rate for data send to your spokes

# Direct Connect

-   it is a direct connection (not Internet based) and provices higher speeds (bandwidth), less latency and higher performance than Internet
-   a virtual interface (VIF) is basically a 802.1Q VLAN mapped from the customer router to the Direct Connect router
-   you need one private VIF to connect to your private VPC subnets, and one public VIF to connect your AWS public services
-   you can **NOT** establish layer 2 over your DX connection
-   you can **NOT** use NAT instances/gateway in your VPC over the direct connect connection

-   for high availability you can

    -   set up multiple DX connections (even through different providers), but this is a costly solution
        -   highest in therms of availability
        -   two direct connect connections from two different providers
        -   two customer routers
        -   two direct connect routers
        -   two AWS direct connect locations
        -   eBGP routing and possibility of active/active or active/failover
    -   or
        -   one DX connection and backup VPN connection
        -   two custormer routers
        -   primary is DX connection, fallback is VPN

-   once connected via DX, you can access all availability zones in a region
    -   and you can establish IPSec VPN tunnels over the Public VIF to connect to remote regions as well

# VPC Endpoints

With VPC endpoints, your EC2 instances/Apps can leverage higher performance, and more secure connections to connect via its private IP address, to AWS services without the need to go over the Internet (IGW), VPC connections, or NAT gateways, or public IP addresses.

-   a VPC endpoint enables you to privately connect your VPC to supported AWS services and VPC endpoint services powered by _PrivateLink_ without requiring an internet gateway, NAT instance, VPN connection, or AWS Direct Connect connection.
-   instances in your VPC do not require public IP addresses to communicate with resources in the service
-   traffic between your VPC and the other service does **NOT** leave the Amazon network
-   endpoints are virtual devices, they are horizontally scaled, redundant, and highly available VPC components that allow communication between instances in your VPC and services without imposing availability risks or bandwidth constraints on your network traffic
-   there are two types of VPC endpoints: _interface endpoints_ and _gateway endpoints_, create the type of VPC endpoints required by the supported service

## Interface Endpoints

-   An interface endpoint is an elastic network interface with a private IP address that serves as an entry point for the traffic destined to a supported service

supported services:

-   API Gateway
-   CloudFormation
-   CloudWatch
-   CloudWatch events/logs
-   EC2 API
-   KMS
-   Kinesis Data Stream
-   ELB
-   SNS
-   Systems Manager
-   Endpoint Services hosted by other AWS accounts
-   STS
-   Codebuild
-   AWS Config
-   Service Catalogue
-   Secrets Manager
-   Amazon SageMaker and Amazon SageMaker Runtime
-   Amazon SageMaker Notebook Instance

## Gateway Endpoint

A gateway endpoint is a gateway that is a target for a specified route in your route table, used for traffic destined to a supported AWS service. The following AWS services are supported: **Amazon S3**, **DynamoDB**

-   you need endpoints policy to control who can access what
-   endpoints are supported within the **same region only** (you can **NOT** set up our VPC gateway endpoint in one region to access S3 bucket in other region)
-   you need to add appropriate route to your route tables

# Flow Logs

-   VPC Flow Logs is a feature that enables you to capture information about IP traffic going to and from network interfaces (ENI) in your VPC
-   Flow Logs can help you with a number of tasks

    -   to troubleshoot why specific traffic is not reaching an instance, which in turn helps you diagnose overly restirictive security group rules
    -   you can also use flow logs as a security tool to monitor the traffic that is reaching your instance

-   you can create a flog log for a VPC, a subnet, or a network interface
    -   if you create a flow log for a subnet or VPC, each network interface in the VPC or subnet is monitored
-   flow log data for a monitored network interface is recoreded as flow log records, which are log events consisting of fields that describe the traffic flow
-   flow log data can be published to Amazon CloudWatch Logs and Amazon S3

    -   after you've created a flow log, you can retrive and view its data in the chosen destination

-   to create a flow log

    -   you specify the resource for which to create the flow log
    -   the type of traffic to capture (accepred traffic, rejected traffic, or all traffic)
    -   the destination to which you want to publish the flow log data

-   CloudWatch logs charges apply when using flow logs, whether you send then to CloudWatch Logs to Amazon S3
-   After you've created a flow log, it can take several minutes to begin collecting and publishing data

# DHCP

-   you can use an on-premise DNS for your AWS VPC environment
-   but you can **NOT** use _Route 53_ and a DNS for your on-premise infrastructure
-   the Dynamic Host Configuration Protocol (DHCP) provides a standard for passing configuration information to hosts on a TCP/IP network
-   the _options field_ of a DHCP message contains the configuration parameters
-   some of those parameters are the domain name, domain name server, and the netbios-node-type
-   you can configure DHCP options sets for your virtual private cloud (VPC)

-   after you create a set of DHCP options, you can **NOT** modify them

    -   if you want your VPC to use a different set of DHCP options, you must create a new set and associate them with your VPC
    -   you can also set up your VPC to use no DHCP options at all

-   you can have multiple sets of DHCP options, but you can associate only one set of DHCP options with a VPC at a time

    -   if you delete a VPC, the DHCP options set associated with the VPC are also deleted

-   after you associate a new set of DHCP options with a VPC, any existing instances and all new instances that you launch in the VPC use these options
    -   you don't need to restart or relaunch the instances, they automatically pick up the changes within a few hours, depending on how frequently the instance renews is DHCL lease
