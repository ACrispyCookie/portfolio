// ACrispyCookie/ECE415-High-Performance-Computing Lab3/src/step8/Convolution2D.cu@50c8f6c75a6140f34fd8d9d1eef9700d61565a0b L137-L152
__global__ void convolutionRowGPU(PixelScalar *d_Dst, PixelScalar *d_Src, PixelScalar *d_Filter,
                               int imageW, int imageH, int filterR) {
    int k;
    PixelScalar sum = 0;
    int paddedWidth = (imageW + filterR);
    int x = blockIdx.x * blockDim.x + threadIdx.x + filterR;
    int y = blockIdx.y * blockDim.y + threadIdx.y + filterR;

    for (k = -filterR; k <= filterR; k++) {
        int d = x + k;

        sum += d_Src[y * paddedWidth + d] * d_Filter[filterR - k];
    }

    d_Dst[y * paddedWidth + x] = sum;
}
