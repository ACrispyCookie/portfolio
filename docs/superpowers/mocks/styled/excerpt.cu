__shared__ float shX[BLOCK_SIZE], shY[BLOCK_SIZE], shZ[BLOCK_SIZE];
int num_tiles = n_padded / BLOCK_SIZE;

#pragma unroll 2
for (int tile = 0; tile < num_tiles; tile++) {
    int j_local = threadIdx.x;

    shX[j_local] = __ldg(&soa.x[system_offset + tile * BLOCK_SIZE + j_local]);
    shY[j_local] = __ldg(&soa.y[system_offset + tile * BLOCK_SIZE + j_local]);
    shZ[j_local] = __ldg(&soa.z[system_offset + tile * BLOCK_SIZE + j_local]);

    __syncthreads();

    #pragma unroll 8
    for (int j = 0; j < BLOCK_SIZE; j++) {
        float jX = shX[j]; float jY = shY[j]; float jZ = shZ[j];

        float dx1 = shX[j] - myX1; float dy1 = shY[j] - myY1; float dz1 = shZ[j] - myZ1;
        float d2_1 = fmaf(dx1, dx1, fmaf(dy1, dy1, fmaf(dz1, dz1, SOFTENING)));
        float inv1 = rsqrtf(d2_1); float inv3_1 = inv1 * inv1 * inv1;
        Fx1 = fmaf(dx1, inv3_1, Fx1); Fy1 = fmaf(dy1, inv3_1, Fy1); Fz1 = fmaf(dz1, inv3_1, Fz1);

        // ... the same for bodies 2, 3 and 4
    }
    __syncthreads();
}
