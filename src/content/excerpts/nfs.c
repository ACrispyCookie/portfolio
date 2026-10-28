// ACrispyCookie/ECE348-Distributed-Systems project3/client/src/client.c@6caf1bf215a16ac048d3be27da8fc54b07b373c5 L181-L203
    CacheBlockT *cached = cache_get(server_fid, block_index);
    if (cached && cache_is_fresh(cached)) {
#ifdef DEBUG
        printf("[DEBUG] Block is cached and fresh returning cached...\n");
#endif
        long available = (long)cached->data_len - block_offset;
        if (available <= 0) { 
            pthread_mutex_unlock(&lock); 
            return 0; 
        }
        if (bytes_to_copy > available) 
            bytes_to_copy = available;
        memcpy(buf, cached->data + block_offset, bytes_to_copy);
        client_file->pos += bytes_to_copy;
        pthread_mutex_unlock(&lock);
        return bytes_to_copy;
    }

    PacketT packet = create_packet(READ);
    packet.body.read_req.fid = client_file->server_file->fid;
    packet.body.read_req.cached_mtime = cached ? cached->mtime : 0;
    packet.body.read_req.cached_mtimensec = cached ? cached->mtimensec : 0;
    packet.body.read_req.length = block_size;
