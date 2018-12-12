-   [VPC](#vpc)
-   [Default VPC](#default-vpc)
-   [VPC Peering](#vpc-peering)
-   [NAT instance](#nat-instance)
-   [NAT gateway](#nat-gateway)
-   [Review](#review)

# VPC

-   you can think of VPC as a virtual data centre in the cloud

Amazon Virtual Priva Cloud (VPC) lets you provision a logically isolated section of the Amazon Web Services (AWS) Cloud where you can lauch AWS resources in a virtual network that you define. You have complete control over your virtual networking environment, including selection of your own IP address range, creation of subnets, and configuration of route tables and network gateways.

You can easily customize the nework configuration for your Amazon Virtual Private Cloud. For example, you can create a public-facing subnet for your webservers that has access to the Internet, and place your backed systems as adatabases or application servers in a private-facing subnet with no Internet access. You can leverage multiple layers of security, including security groups and network access control lists, to help control access to Amazon EC2 instances in each subnet.

Additionally, you can create a Harware Virtual Private Network (VPN) connection between your corporate datacenter and your VPC and leverage the AWS cloud as an extension of your corporate datacenter.

we can:

-   launch instances into a subnet of your choosing
-   assing custom IP address ranges in each subnet
-   configure route tables between subnets
-   create internet gateway and attach it to your VPC (there can only be one gateway per VPC, it is usuallu highly available and spans across multiple availability zones, therefore there should not be any need for additional gateway)
-   much better security control over your AWS resources
-   instance security groups
-   subnet network access control lists (ACLS)

# Default VPC

-   default VPC is user friendly, allowing you to immediatelly deploy instances
-   all subnets in default VPC have a route out to the Internet
-   Each EC2 instance has bot a private and public IP address (in case of custom private VPC, EC2 instances have only private IP address)

# VPC Peering

-   allows you to connect one VPX with another via a direct network route using private IP addresses
-   instances behave as if they were on the same private network
-   you can peer VPC's with other AWS accounts as well as with other VPCs in the same account
-   peering is in a star configuration: ip 1 central VPC peer with 4 others, **NO TRANSITIVE PEERING**

# NAT instance

-   when creating a NAT instance, **disable** source/destination check in the instance
-   NAT instances must be in a public subnet
-   there must be a route out of the private subnet to the NAT instance, in order for this to work
-   the amoun of traffic that NAT instances can support depends on the instance size, if you are bottlenecking, increase the instance size
-   you can create high availability using Autoscaling Groups, multiple subnets in different AZs, and a script to automate failover
-   behind a security group
-   need to disable Source/Destination checks

# NAT gateway

-   preferred by the enterprise
-   scale automatically up to 10Gbps
-   no need to patch
-   not associated with security groups
-   automatically assigned a public ip address
-   remember to update your route tables
-   no need to disable Source/Destination checks

# Review

-   think of VPC as a logical datancenter in AWS
-   consists of IGWs (or Virtual Private Gateways), route tables, Network access control lists, subnets and security groups
-   1 subnet = 1 availability zone (1 subnet **CANNOT** span multiple AZs)
-   security groups are stateful, network access control lists are stateless
-   no transitive peering
    -   subnets A and B are peered, B and C are peered, but if we want to allow peering between A and C then we need to set it up
