// ACrispyCookie/ECE340-Embedded-Systems Lab3/sw_x86/src/4-less-accesses.c@6e0e9d49bb8d4807b125d16b87de9a31566d2eb1 L57-L82
			match = (string1[j] == string2[i]) ? MATCH : MISS_MATCH;

			northwest_value += match;
			north_value = similarity_matrix[similarity_index - N - 1] + GAP_d;

			max_value = northwest_value;
			direction = NORTH_WEST;

			int cond_north = (north_value > max_value);
			max_value = cond_north ? north_value : max_value;
			direction = cond_north ? NORTH : direction;

			int cond_west = (west_value > max_value);
			max_value = cond_west ? west_value : max_value;
			direction = cond_west ? WEST : direction;

			int cond_zero = (0 >= max_value);
			max_value = cond_zero ? 0 : max_value;
			direction = cond_zero ? CENTER : direction;

			similarity_matrix[similarity_index] = max_value;
			direction_matrix[index] = direction;
			
			*max_index = max_value > similarity_matrix[*max_index] ? similarity_index : *max_index;
			northwest_value = north_value - GAP_d;
			west_value = max_value + GAP_i;
