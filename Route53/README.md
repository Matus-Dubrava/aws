-   [DNS](#dns)
-   [Simple Routing Policy](#simple-routing-policy)
-   [Weighted Routing Policy](#weighted-routing-policy)
-   [Latency Routing Policy](#latency-routing-policy)
-   [Failover Routing Policy](#failover-routing-policy)
-   [Geolocation Routing Policy](#geolocation-routing-policy)
-   [Multivalue Answer Routing Policy](#multivalue-answer-routing-policy)

# DNS

DNS is used to convert human friendly domain names (such as http://acloud.guru) into an Internet Protocol (IP) address (such as http://13.111.879.1)

IP addresses are used by computers to indentify each other on the network.

IP addresses commonly come in 2 different forms, IPv4 (32 bit field) and IPv6 (128 bit field)

## top level domains

`bbc.co.uk` - `.uk` is the top level domain name, `.co` is the second level domain name

These top level domain names are controlled by Internet Assigned Numbers Authority (IANA) in a root zone database which is eesentially a database of all available top level domains. You can view this database by visiting:

`http://iana.org/domains/root/db`

## Domain Registrars

Because all of the names in a given domain name have to be unique there needs to be a way to organize this all so that domain names aren't duplicated. This is where domain registrars come in. A registrar is an authority that can assign domain names direclty under one or more top-level domains. These domains are registered with InterNIC, a service of ICANN, which enforces uniqueness of domain names across the Internet. Each domain name becomes registered in a central database known as the WhoIS database.

## Start Of Authority Record (SOA)

The SOA record stores information about

-   the name of the server that supplied the data for the zone
-   the administrator of the zone
-   the current version of the data file
-   the default number of seconds for the time-to-live file on resource recors

SOA record is information stored in a DNS zone about that zone. A DNS zone is the part of a domain for which an individual DNS server is responsible (i.e. the bit that you store A records, C-names etc.). Each zone contains a single SOA record.

## NS records

NS stands for Name Server records. They are used by Top Level Domain servers to direct traffic to the Content DNS server which contains the authoritative DNS records.

## A records

An **A** recors is the fundamental type od DNS record. The **A** in A record stnads for Address. The A record is used by a computer to translate the name of the domain to an IP address.
For example, `http://www.mywebsite.com` might point to `http://101.10.10.90`

## TTL

The length that a DNS recor is cached on either the Resolving Server or the users own local PO is equal to the value of the "Time To Live" (TTL) in seconds. The lower time to live, the faster changes to DNS recors take to propagate throughout the internet.

## CNAMES

A Canonical Name (CName) can be used to resolve one domain name to another. For example, you may have a mobile website with the domain name `http://m.acloud.guru` that is used for when users browse to your domain name on their mobile devices. You may also want the name `http://mobile.acloud.guru` to resolve to this same address.

## Alias Records

Alias recors are used to map resource record sets in your hosted zone to Elastic Load Balancers, CloudFront distributions, or S3 buckets that are configured as websites.

Alias recors work like a CNAME record in that you can map one DNS name (`www.example.com`) to another 'target' DNS name (`elb1234.elb.amazonaws.com`).

Key difference - a CNAME can't be used for naked domain names (zone apex record.). You can't have a CNAME for `http://acloud.guru`, it must be either an A record or an Alias.

-   ELBs do not have pre-defined IPv4 addresses, you resolve to them using a DNS name

Alias resource record sets can save you time because Amazon Route 53 automatically recognizes changes in the record sets that the alias resource record set refers to. For example, suppose an alias resource record set for `example.com` points to ELB load balancer at `lb1-1234.us.east-1.elb.amazonaws.com`. If the IP address of the load balancer changes, Amazon Route 53 will automatically reflect those changes in DNS answers for `example.com` without any changes to the hosted zone that contains resource record sets for `example.com`

## Common DNS types

-   SOA records
-   NS records
-   A records
-   CNAMES
-   MX records
-   PTR records

# Simple Routing Policy

If you choose the simple routing policy you can only have one record with multiple IP addresses. If you specify multiple values in a record, Route 53 returns all values to the user in a random order. (random IP address is chosen when user vists our domain)

# Weighted Routing Policy

Weighted Routing Policies let you split your traffic based on different weights assigned.

E.g. we can tell Route 53 to send 20% of the traffic to US-EAST-1 and 80% of traffic to US-WEST-1.

# Latency Routing Policy

Latency based routing allows you to route your traffic based on the lowest network latency for your end user (ie which region will give them the fastest reponse time).
To use latency-based routing, you create a latency resource record set for the Amazon EC2 (or ELB) resource in each region that hosts your website. When Amazon Route 53 receives a query for your site, it selects the latency resourcerecord set for the region that gives the user the lowest latency. Route 53 then responds with the value associated with that resource record set.

# Failover Routing Policy

Failover routing policies are used when you want to create an acvite/passive set up. For example, you may what your primary site to be in EU-WEST-2 and your secondary DR Site in AP-SOUTHEAST-2.

Route 53 will monitor the health of your primary site using a health check.

A health check monitors the health of your end points.

If the main end point fails, Route 53 will send traffic to the secondary end point.

# Geolocation Routing Policy

Geolocation routing lets you choose where your traffic will be sent based on the geographic location of your users (ie the location from which DNS queries originate). For example, you might want all queries from Europe to be routed to a fleet of EC2 instances that are specifically configured for your European customers. These servers may have the local language of your European customers and all prices are displayed in Euros.

# Multivalue Answer Routing Policy

If you want to route traffic approximatelly randomly to multiple resources, such as web servers, you can create one multivalue answer record for each resource and, optionally, associate an Amazon Route 53 health check with each record. For example, suppose you manage an HTTP web service with a dozen web servers that each have their own IP address. No one web server could handle all of the traffic, but if you create a dozen multivalue answer records, Amazon Route 53 responds to DNS queries with up to eight healthy records in response to each DNS query. Amazon Route 53 gives different answers to different DNS resolvers. If a web server becomes unavailable after a resolver caches a response, client software can try another IP address in the response.
