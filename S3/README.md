[S3](#s3)
[Data Consistency](#data-consistency)

# S3

-   Simple Storage System.
-   Object based, used as a file storage (0 - 5TB).
-   files are stored in buckets which have name associated witch them, this name must be globally unique (there can't be two buckets with the same name); example **https://s3-eu-west-1.amazonaws.com/myuniquebucketname** where part - **s3-ue-west-1** is the name of availability zone
-   once we successfully upload file to S3, we get back http response with 200 status code

# Data Consistency

There are 2 types of data consistency in S3 - **immediate** and **eventual**.

Immediate consistency - read after write for PUTS operarion. This means that when we upload a new file to S3 and try to read that file rigth after, what we get back will be the newly uploaded file.

Eventual consistency for overwrites - PUTS and DELETES - when we modify an existing file, such operation can take a certain amount of time because S3 is spread across multiple availability zones (it will take some tome to propagate changes) so we get either the updated or old file content when we try to read it immediatelly after we have performed some update operation. Eventual consistency means that it will be consistent, eventually.
