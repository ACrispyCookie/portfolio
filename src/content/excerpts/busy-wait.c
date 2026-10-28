// ACrispyCookie/ECE321-Concurrent-Programming Project1/assignment2/src/ask2.c@f840faa556c2f3d867830648c341e346bfedf01f L140-L158
void *run_worker(void *arg) {
    worker_t *self = arg;
    while(1) {
        self->state = AVAILABLE;
        while (self->command == WAIT) {}
        if (self->command == TERMINATE) {
            self->state = TERMINATING;
            break;
        }
        /*
        Resetting the command of the master before setting the state of the worker
        so that the worker doesn't repeat the processing of the same value
        and the master doesn't get its command overwritten.
        */
        self->command = WAIT;
        self->state = WORKING;
        printf("Worker #%d: %lld is %sprime\n", self->id, self->value_to_process, is_prime(self->value_to_process) ? "" : "not ");
    }
    return NULL;
