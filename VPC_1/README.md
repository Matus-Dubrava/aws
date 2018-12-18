-   [VPC](#vpc)
    -   [Types](#types)
-   [Components](#components)
    -   [Implied Router](#implied-router)
    -   [Route Tables](#route-tables)
    -   [VPC IP Addressing](#vpc-ip-addressing)
        -   [AWS Reserved IPs in each subnet](#aws-reserved-ips-in-each-subnet)
    -   [Internet Gateway](#internet-gateway)
    -   [Security Groups](#security-groups)

# VPC

-   is a virtual network or data center inside of AWS for one client, or a department in an enterprise
-   the aws client has full control over resources and virtual compute instances (virtual servers) hosted inside that VPC
-   is similar to having your own data center inside AWS
-   logically isolated from other VPCs on AWS
-   you can have one or more IP address subnets inside a VPC

VPC can span only one region (we can't have one VPC that spans serveral regions), but we can connect them via VPC peering.

We can have multiple subnets inside of one VPC, and one subnet can span only one Availability Zone (we can have one subnet stretched across two or more AZs), but we can have multiple subnets inside of one AZ. Similarly, we can have more VPC inside on a single region (but there is a limit of 5 VPC per region per account).

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
        **inbound**
    -   _source | protocol | port_
    -   _def-sg-id | all | all | allow_
        **outbound**
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
