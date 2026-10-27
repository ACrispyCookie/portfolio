// ACrispyCookie/ECE415-High-Performance-Computing Lab1/src/14_sobel_fast_conv_sqrt.c@50c8f6c75a6140f34fd8d9d1eef9700d61565a0b L98-L120
	for (i = 1; i < SIZE - 1; i++) {
		// Referencing
		const unsigned char *top_row = &input[dec_i_times_SIZE];
		const unsigned char *bottom_row = &input[inc_i_times_SIZE];
		const unsigned char *mid_row = &input[i_times_SIZE];
		unsigned char *out_row = &output[i_times_SIZE];
		
		for (j = 1; j < SIZE - 1; j++) {
			pixel_horizontal = -top_row[j - 1] + top_row[j + 1];
			pixel_vertical = top_row[j - 1] + (top_row[j] << 1) + top_row[j + 1];
			pixel_horizontal += -(mid_row[j - 1] << 1) + (mid_row[j + 1] << 1) - bottom_row[j - 1] + bottom_row[j + 1];
			pixel_vertical += -bottom_row[j - 1] - (bottom_row[j] << 1) - bottom_row[j + 1];
			
			square_sum = pixel_horizontal * pixel_horizontal + pixel_vertical * pixel_vertical;
			sqrt = * ( int * ) &square_sum;
			sqrt = (sqrt >> 1) + 0x1FBD3F7D;
			res = (int) (* ( float * ) &sqrt);
			out_row[j] = (res > 255) ? 255 : (unsigned char)res;
		}
		dec_i_times_SIZE += SIZE;
		inc_i_times_SIZE += SIZE;
		i_times_SIZE += SIZE;
	}
