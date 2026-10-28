// ACrispyCookie/ECE348-Distributed-Systems project1/server/src/internal_server.c@6caf1bf215a16ac048d3be27da8fc54b07b373c5 L144-L167
    // Duplicate currently in process
    if (servicelist_containsReq(serviceRegistry, req) || reqlist_contains(activeRequests, req, NULL)) {
#ifdef DEBUG
    printf("Request was active so dropping...\n");
#endif
        return 1;
    }

    // Duplicate already processed
    RequestT *cached;
    int success = reqlist_contains(cachedRequests, req, &cached);
    if (success) {
#ifdef DEBUG
    printf("Reply was cached, %s\n", cached->packet.payload == NULL ? "but expired..." : "so resending...");
#endif
        cached->clientAddr = req->clientAddr;
        cached->clientAddrLen = req->clientAddrLen;
        cached->id = req->id;
        if (cached->packet.payload == NULL)
            cached->packet.type = EXPIRED;

        updateCachedRequest(cached, 1);

        reqlist_add(replies, cached);
