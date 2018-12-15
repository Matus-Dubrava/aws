-   [Elastic Transcoder](#elastic-transcoder)

# Elastic Transcoder

Media Transcoder in the cloud. Converts media files from their original source format into different formats that will play on smartphones, tablts, PC's ets.

Provides transcoding presets for popular output formats, which means that you don't need to guess about which settings work best on particular devices.

Pay based on the minutes that you transcode and the resolution at which you transcode.

i.e.

_store video in S3 bucket -> triggers lambda function -> run elastic transcoder -> store converted media file back to the same or new S3 bucket_
