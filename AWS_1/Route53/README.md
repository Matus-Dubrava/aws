-   [Route53](#route53)
    -   [hosted zones](#hosted-zones)
    -   [migrating a domain](#migrating-a-domain)
    -   [DNS record types](#dns-record-types)
    -   [routing policies](#routing-policies)

# Route53

-   Route53 performns three main functions

    -   register a domain
    -   as a DNS, it routes Internet traffic to the resources for your domain
    -   checks the health of your resources,
        -   Route53 sends automated requests over the Internet to a resource (can be a web server) to verify that the server is, reachable, functional, available
    -   also, you can choose to receive notofications when a resource becomes unavailable and choose to route Internet traffic away from unhealthy resources

-   you can use AWS Route53 for any combination of these functions

    -   for example, you can use Route53 both to register your domain name and to route Internet traffic for the domain
    -   or you can use Route53 to route Internet traffic for a domain that you registered with another domain registrar

-   when you register a domain with Route53, the **service automaitcally makes itself the DNS service for the domain** by doing the following
    -   it creates a hosted one that has the same name as your domain
    -   it assigns a set of four name servers to the hosted zone, unique to the account
        -   when someone uses a browser to access your website, these name servers inform the browser where to find your resources, such as a web server or an Amazon S3 bucket
    -   it gets the name servers from the hosted zone and adds them to the domain

**AWS supports** - **generinc top-level domains** - **geographic top-level domain**

-   registering a domain with Route53
    -   you can register a domain with Route53 if the TLD (top-level domain) is included on the supported TLD lists
    -   if the TLD isn't included, you can't register the domain with Route53

**using Route53 as your DNS service**

-   you can use Route53 as the DNS service for any domain, even if the TLD for the domain isn't icluded on the supported lists
    -   create a hosted zone with the same name as your domain name
    -   AWS will create 4 name servers for that hosted zone
    -   replace the name servers enrty in your external registrar with the onse provided by AWS

**steps to configure Route53**

-   you need to register a domain, this can be Route53, or another DNS registrar, but the you connec your Domain name in that registrar to Route53
-   create Hosted zone on Route53, this is done automatically if you registered your domain using Route53
    -   has to be done manually if you registered your domain with some other registrar
-   inside the hosted zone you need to create record sets

**delegate to Route53**

-   this step connects everything and makes it work
-   connect the domain name to the Route53 hosted zone(s) - this is called _delegation_

    -   update your domain registrar with the correct NS for your Route53 hosted zone (this list on NS servers is called a _delegation set_ and is unique to you)
        -   no other customer hosted zone will share this delegation set
    -   doing this means Route53 service will be serving DNS traffic for the domain of the hosted zone
    -   if you registered your domain with a different registrar, you need to configure the Route53 NS servers' list in your registrar's DNS database for your domain

-   if you are using another domain provider and you did all the changes

    -   when you migrate from one DNS provider to another, for an existing domain, this change can take up to 48 hours to be effective
    -   this is because name server DNS recors are typically cached across the DNS system globally on the Interner for up to 48 hours (TTL) period

-   you can transfer a domain to Route53 if the TLD is included on the following lists
-   if the TLD isn't included, you can't transfer the domain to Route53
-   for most TLDs, you need to get an authorization code from the current registrar to transfer a domain

## hosted zones

-   Route53 hosted zone is a collection of records for a specific domain
-   you create a hosted zone for a domain, and then you create a record to tell the domain name system how you want traffic to be routed for that domain
    -   basically, a hosted zone is a container that holds information about how you want to route traffic for a domain and its subdomains
    -   you can create public (Internet) hosted zones, or private (internal DNS) hosted zones
-   for each public hosted zone that you create, Amazon Route53 automatically creates a name server (NS) record and a start of authority (SOA) record, **don't change these recors**
-   route 53 automatically creates a name server (NS) record with the same name as your hosted zone

    -   it lists the four name servers that **are the authoritative names servers** for your hosted zone
    -   do not add, change, or delete name servers in this record

-   when you create a hosted zone, Route53 automatically creates a name server (NS) recor and a start of authority (SOA) record for the zone
-   the NS record identifies the four name servers that you give to your registrar or your DNS service so that DNS queries are routed to Route53 name servers
-   by default, Route53 assigns a unique set of four name servers (known collectively as a _delegation set_) to each hosted zone that you create
-   example of the format for the names of Route53 name servers

    -   _ns.2048.awsdns-64.com_
    -   _ns.2049.awsdns-65.net_
    -   _ns.2050.awsdns-66.org_
    -   _ns.2051.awsdns-67.co.uk_

-   once you update the Route53's NS settings with your domain registrar to include the Route53 name servers, Route53 will be responsible to respond to DNS queries for the hosted zone

    -   this is true whether you do have a functioning website or not
    -   Route53 will respond with information about the hosted zone whenever someone types the associated domain name in a web browser

-   you ca create more than one hosted zone with the same name and add different records to each hosted zone

    -   Route53 assigns four name servers to every hosted zone
    -   the name servers are different for each of them
    -   when you update your registrar's name server records, be careful to use the Route53 name servers for the correct hosted zone - the one that contains the recors that you want Route53 to use when responding to queries for your domain
    -   Route53 never returns values for records in other hosted zones that have the same name

-   inside the hosted zone by default you have two entries
    -   NS entry
        -   contains the unique set of name servers for this hosted zone
    -   SOA entry
        -   contains information about the hosted zone

## migrating a domain

-   if you're currently using another DNS service and you want to migrate to Route53
    -   start by creating a hosted zone
        -   Route53 automatically assigns the delegations set, the four name servers to your hosted zone
    -   to ensure that the DNS routes queries for your domain to the Route53 name servers
        -   update your registrar's or your NDS service's NS recors for the domain to replace the current name servers with the names of the four Route53 name servers for your hosted zone
        -   the method that you use to update the NS records depends on which registrar or DNS service you're using
    -   some registrars only allow you to specify name servers using IP addresses; they don't allow you to specify fully qualified domain names
        -   if your registrar requires using IP addresses, you can get the IP addresses for your name servers using the _dig_ utility (for Max, Unix, or Linux) or the _nslookup_ utility (for Windows)

### transferring a domain to a different AWS account

-   if you registered a domain using one AWS account and you want to transfer the domain to another AWS account, you can do so by contacting the AWS support center and requesting the transfer

### Migrating a hosted zone to a different AWS account

-   if you're using Route53 as the DNS service for the domain, Route53 doesn't transfer the hosted zone when you transfer a domain to a different AWS account
-   if domain registration is associated with one account and the corresponding hosted zone is associated with another account, neither domain registration nor DNS functionality is affected
    -   the only effect is that you'll need to sign into Route53 console using one account to see the domain, and sign in using the other account to see the hosted zone
-   you can optionally transfer the hosted zone for the domain to a different account too

## DNS record types

**supported DNS record types by Route53**

-   **A record** - address record - maps domain to IP address
    -   _www.example.com_ IN A 2.2.2.2
-   **AAAA record** - IPv6 address record - maps domain name to an IPv6 address
    -   _www.example.com_ IN AAAA 2001:d8b1::1
-   **CNAME record** - maps an alias to a hostname (ie. ELB DNS name to a domain name)
    -   web IN CNAME _www.example.com_
-   **NS record** name server record - used for delegating zone to a nameserver
    -   _www.example.com_ IN NS _ns1.example.com_
-   **SOA record** - start of authority record
-   **MX record** - mail exchanger - defines where to deliver mail for user @ a domain name
    -   _example.com IN MX 10 \_mail01.example.com_ | IN MX 20 _mail02.example.com_
-   CAA, PTR, NAPTR, SPF, SRV, TXT records

### SOA

-   every single zone has one and only one SOA record at the beginning of the zone
-   it is not an actual record, it includes the following information
    -   who the owner is (email for the admin)
    -   the authoritative server
    -   the serial number which is incremented with changes to the zone data
    -   the refreshing time/cycle info, and the TTL

### CNAME

-   a CNAME value element is the same format as a domain name
-   the DNS protocol does not allow you to create a CNANME record for the top node of a DNS namespace, also known as the zone apex (or root domain, or naked domain)
    -   for example, if you register the DNS name _example.com_. the zone apex is _example.com_
        -   you cannot create a CNAME records for _example.com_
    -   however, you can create CNAME records for _www.example.com_, _support.example.com_, and so on
-   in addition, if you create a CNAME record for a subdomain, you cannot create any other records for that subdomain
    -   for example, if you create a CNAME for _www.example.com_
        -   you cannot create any other records for which the value of the name field is _www.example.com_

### Alias Record

-   specific to Route53 and not seen outside
-   you can use it to create DNS Route53 Records and route queries to AWS services the IP address of whichc can change (CLB/ALB/NLB, Cloud Front distribution, S3 bucket, Elastic Beanstalk environment)
    -   for these services, it does not make sense to hard code the IP address in the DNS record
    -   rather, point an Alias to the AWS service, and Route53 will fetch the IP address of that service's resource(s) in real time to respond to DNS queries
-   you CAN'T create a CNAME for the apex/naked/root domain name

    -   Alias Record CAN do that
    -   you can Alias to other Route53 DNS records in the same hosted zone

-   while ordinary Route 53 records are standard DNS records, Alias records provide a Route53-specific extension to DNS functionality
-   instead of an IP address or a domain name, an alias record contains a pointer to a **CouldFront distribution**, an **Elastic Beanstalk** environment, an **ELB Classic, application, network load balancer**, an **Amazon S3 bucket** that is configured as a static website, or **another Route53 record in the same hosted zone**

-   when Route53 receives a DNS query that matches the name and type in an alias record, Route53 follows the pointer and responds with the applicable value

    -   **an alternate domain name of a CloudFront distribution** - Route 53 responds as if the query had asked for the CloudFront distribution by using the CloudFront domain name, such as _d111111abcdeff8.cloudfront.net._
    -   **and elastic beanstalk environment** - Route53 responds to each request with one or more IPs
    -   **an ELB load balancer** - Route53 responds to each request with one or more IP addresses for the LB
    -   **an S3 bucket that is configured as a static website** - Route53 responds to each request with one IP address for the S3 bucket
    -   **another Route53 record in the same hosted zone** - Route 53 responds as if the query had asked for the record that is referenced by the pointer

-   if an alias record points to a CloudFront distribution, an Elastic Beanstalk environment, an ELB load balancer, or an S3 bucket, **you cannot set the time to live (TTL)**
    -   Route53 uses the CloudFront, Elastic Beanstalk, ELB or S3 TTLs
    -   if an alias record points to another record in the same hosted zone, Route53 uses the TTL of the record that the alias record points to
    -   alias records can save you time because Route53 automatically recognizes changes in the records that the alias record refers to
    -   example, suppose an alias record for _example.com_ points to an ELB load balancer at _lb1.1234.us-east-2.elb.amazonaws.com_
        -   if the IP address of the load balancer changes, Route53 will automatically reflect those changes in DNS answer for this domain without any changes to the hosted zone that contains records for _example.com_

## routing policies

-   when you create a record, you choose a routing policy, which determines how Route53 responds to queries
    -   **simple routing policy** - default
        -   use for a single resource that performs a given function for your domain
        -   use case: a web server that serves content for the _example.com_ website
    -   **failover routing policy**
        -   use when you want to configure active-passive failover
    -   **geolocation routing policy**
        -   use when you want to route traffic based on the location of your users
    -   **latency routing policy**
        -   use when you have resources in multiple locations and you want to route traffic to the resource that provides the best latency
    -   **weighted routing policy**
        -   use to route traffic to multiple resources in proportions that you specify
    -   **geoproximity routing policy** (requires route flow)
        -   use when you want to route traffic based on the location of your resources and, optionally, shift traffic from resources in one location to resources in another
    -   **multivariate answer routing policy**
        -   use when you want Route53 to respond to DNS queries with up to eight healthy records selected at random

### Failover routing

-   failover routing lets you route traffic to a resource when the resource is healthy
    -   if the main resource is not healthy, then route traffic to a different resource
    -   the primary and secondary records can route traffic to anything from an S3 bucket that is configured as a website to a complex tree of records

### Geolocation routing

-   geolocation routing lets you choose the resources that serve your traffic based on the geographical location of your users, ie. the location that DNS queries originate from
-   for example, you may have presence in USA and EUROPE and want users in the US to be served in the US, and those in Europe to be served by servers in Europe
-   use cases and benefits for using geolocation routing

    -   you can localize your content and present some or all of your website in the language or your users
    -   you can also use geolocation routing to restric distribution of content to only the locations in which you have distribution rights
    -   another possible use is for balancing load across endpoints in a predictable, easy-to-manage way, so that each user location is consistently routed to the same endpoint

-   you can specify geographic locations by continent, by country, or by state in the US
-   if you create separate records for overlapping geographic regions - for example, one record for North America and one for Canada - priority goes to the smallest geographic region
    -   this allows you ro route some queries for a continent to one resource and to route queries for selected countries on that continent to a different resource
    -   geolocation works by mapping IP addresses to locations; however some IP addresses aren't mapped to geographic locations
        -   for those IP addresses, even if you create geolocation records that cover all seven continents, Route53 will receive some DNS queries from locations that it can't identify
        -   you can create a default record that handles both queries from IP addresses that aren't mapped to any location and queries that come from locations that you haven't created geolocation records for
        -   if you don't create a default record, Route53 returns a **no answer** response for queries from those locations

### Latency based routing

-   if you application is hosted in multiple EC regions, you can improve performance for your users by serving their requests from the region that provides the lowest latency
-   to use latency-based routing, you create latency records for your resources in multiple regions
-   when Route53 receives a DNS query for your domain and subdomain
    -   it determines which regions you've created latency records for
    -   determines whichc region gives the user the lowest latency
    -   then selects a latency record for that region
    -   Route53 responds with the value from the selected record, such as the IP address for a web server

### Weighted routing

-   weighted routing lets you associate multiple resources with a single domain name, or subdomain name, and choose how much traffic is routed to each resource
-   this can be useful for a variety of purposes, including load balancing and testing new versions of software
-   to configure weighted routing, you create records that have **the same name and type** for each of your resources
-   you assign each record a relative weight that corresponds with how much traffic you want to send to each resource
-   Route53 sends traffic to a resource based on the weight that you assign to the record as a portion of the total weight for all records in the group
    -   weight of the specified record/sum of the weight of all records
