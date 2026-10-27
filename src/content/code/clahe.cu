// ACrispyCookie/ECE415-High-Performance-Computing Lab4/src/09_clahe_256-per-tile-priv-scan-stream-both-events.cu@50c8f6c75a6140f34fd8d9d1eef9700d61565a0b L67-L90
    //! Add histogram values to seperate private histograms
    //* Indexing increased by blockDim (here is 16) 1 pixel for each quadrant
    for (int cur_y = ty; cur_y < TILE_SIZE; cur_y += step_y) {
        for (int cur_x = tx; cur_x < TILE_SIZE; cur_x += step_x) {
            const int gx = x_start + cur_x;
            const int gy = y_start + cur_y;

            if (gx < w && gy < h) {
                const unsigned char pix = data[gy * w + gx];

                //! 1/<NUM_BANKS>th of the serialization 
                atomicAdd(&(p_hist[bank_id][pix]), 1);
            }
        }
    }
    __syncthreads();

    //! Sum the banks into the final result
    int bin_sum = 0;
    #pragma unroll
    for (int k = 0; k < NUM_BANKS; k++) {
        bin_sum += p_hist[k][tid];
    }
    hist[tid] = bin_sum;
