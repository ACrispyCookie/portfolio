// ACrispyCookie/ECE321-Concurrent-Programming Project3/assignment3/src/assignment3.c@f840faa556c2f3d867830648c341e346bfedf01f L113-L135
    if (bridge == NOT_ASSIGNED) {
        printf("%d, %c: # ENTERING # I was first on bridge! Claiming bridge...\n", id, team ? 'b' : 'r');
        monitor->bridge = team;
    // If the bridge is taken by another color or full (or another car is waking up)
    } else if (bridge != team || *on_bridge == N || *cars_waiting > 0) {
        printf("%d, %c: # ENTERING # Bridge is either full or different color! Waiting...\n", id, team ? 'b' : 'r');
        (*cars_waiting)++;
        pthread_cond_wait(queue, &monitor->lock);
        (*cars_waiting)--;
    }

    // Logistics
    (*on_bridge)++;
    (*total_cars)++;

    int opposite_cars_waiting = monitor->cars_waiting[!team];
    // If another car of my color is waiting and can fit in the bridge without violating the total limit of 
    // cars of a certain color that can pass at once 
    if (*on_bridge < N && *cars_waiting > 0 && (*total_cars < TOTAL_LIMIT || !opposite_cars_waiting)) {
        printf("%d, %c: # ENTERING # Waking another car from my color...\n", id, team ? 'b' : 'r');
        pthread_cond_signal(queue);
    }

