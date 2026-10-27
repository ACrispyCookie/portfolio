// ACrispyCookie/ECE415-High-Performance-Computing Lab2/src/par_kmeans.c@50c8f6c75a6140f34fd8d9d1eef9700d61565a0b L102-L123
        delta = 0.0;
        #pragma omp parallel for private(j, index) reduction(+:delta)
        for (i=0; i<numObjs; i++) {
            /* find the array index of nestest cluster center */
            index = find_nearest_cluster(numClusters, numCoords, objects[i],
                                         clusters);

            /* if membership changes, increase delta by 1 */
            if (membership[i] != index) delta += 1.0;

            /* assign the membership to object i */
            membership[i] = index;

            /* update new cluster center : sum of objects located within */
            #pragma omp atomic
            newClusterSize[index]++;

            for (j=0; j<numCoords; j++) {
                #pragma omp atomic
	            newClusters[index][j] += objects[i][j];
	        }
        }
