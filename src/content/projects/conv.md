---
title: "CUDA convolution"
kind: "course"
course: "ece415"
main: false
order: 102
step: 3
headline: "Image filters on GPU"
summary: "Image filters on GPU"
tools: ["CUDA", "C", "Python", "Bash", "Git"]
team: ["tsiantos", "tsogkas"]
group: "Image filters on GPU"
results:
  text: "How many times faster the GPU is than the CPU, single precision, by image size."
  bars:
    - { label: "64×64", value: 3.28, display: "3.28×" }
    - { label: "512×512", value: 11.33, display: "11.33×" }
    - { label: "4096×4096", value: 12.78, display: "12.78×" }
    - { label: "8192×8192", value: 16.97, display: "16.97×" }
    - { label: "16384×16384", value: 16.34, display: "16.34×" }
code: { file: "conv.cu", lang: "cpp", url: "https://github.com/ACrispyCookie/ECE415-High-Performance-Computing/blob/50c8f6c75a6140f34fd8d9d1eef9700d61565a0b/Lab3/src/step8/Convolution2D.cu#L137-L152", caption: "The row pass on the padded image: no edge checks inside the loop." }
figures:
  - { section: "no-divergence-at-the-edges", src: "../../assets/projects/conv-padding.png", alt: "The image sits inside a border of padding as wide as the filter's radius, so the filter never reads outside the array" }
---

## What it is

A 2D convolution slides a filter over an image, the basis of blurring, sharpening and edge detection. Ours runs in two passes, along the rows and then down the columns. We moved it to one NVIDIA Tesla K80 GPU on the course server, then measured how it scales against the CPU, from tiny images up to 16384×16384, and how far its answers drift from the CPU's.

## One thread per pixel

A first version used a single block of 1024 threads, one per pixel, so it could only handle a 32×32 image; anything bigger stopped with an "invalid argument" error. The real version uses a grid of 32×32-thread blocks, and each thread works out which pixel is its own from its block and thread numbers.

## Memory sets the limit

In theory the grid of blocks covers images far bigger than any GPU could hold; in practice the GPU's memory runs out first. With the input, a buffer and the output each the size of the image, the largest square image is 31618 pixels a side. Writing the result over the input array instead raised it to 38725.

## Float or double

The GPU fuses a multiply and an add into one instruction with a single rounding; the CPU rounds after each step. In single precision the answers drift apart as the filter grows, from 0.0078125 at a radius of 1 to 640 at a radius of 256. In double precision the gap stays around a millionth even at 256.

Doubles cost speed, though: at 8192×8192 the GPU's lead drops from 16.97× to 14.45×.

## No divergence at the edges

Pixels near the edge need bounds checks the others don't, so the threads of one warp take different paths and wait for each other. A border of padding as wide as the filter's radius removes the checks.

On the K80 the gain was cancelled out by the more complex copies of the padded image. On an RTX 3060 with a 16384×16384 image, the padded version was faster at every filter size: 0.99 to 0.92 seconds at a radius of 128, and 13.05 to 10.91 at 4096.
