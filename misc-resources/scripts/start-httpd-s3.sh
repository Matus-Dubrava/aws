// copy single file from a S3 bucket

#!/bin/bash
yum update -y
yum install httpd -y
service httpd start
chkconfig httpd on
aws s3 cp s3://md-website-simple/index.html /var/www/html

// copy the whole content of a S3 bucker

#!/bin/bash
yum update -y
yum install httpd -y
service httpd start
chkconfig httpd on
aws s3 cp s3://md-website-simple /var/www/html --recursive
