// ACrispyCookie/ECE321-Concurrent-Programming Project2/assignment1/src/mysem.c@f840faa556c2f3d867830648c341e346bfedf01f L69-L86
int mysem_down(mysem_t *s) {
    if (mysem_get(s) == -1)
        return -1;
    struct sembuf op; op.sem_num = 0; op.sem_op = -1; op.sem_flg = 0;

    //Using lock for mutual exclusion
    pthread_mutex_lock(&s->lock);
    --s->val;
    if (s->val == 0) {
        semop(s->id, &op, 1);
        pthread_mutex_unlock(&s->lock);
        return 1;
    }
    pthread_mutex_unlock(&s->lock);
    semop(s->id, &op, 1);

    return 1;
}
