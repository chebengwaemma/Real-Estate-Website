-- Raise admin video upload limit to 1000 MB.
update storage.buckets
set file_size_limit = 1048576000
where id = 'video-files';
