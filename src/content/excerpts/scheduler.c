// ACrispyCookie/ECE318-Operating-Systems Project2/Scheduler_VM/src/schedule.c@fc0be06d24cb4ccfb9e6a19f341ebae7d8031323 L17-L21
#define CALCULATE_EXPECTED_BURST(prev_actual_burst, prev_expected_burst) \
		(((prev_actual_burst) + (ALPHA) * (prev_expected_burst)) / (1 + (ALPHA)))

#define CALCULATE_GOODNESS(expected_burst, min_expected_burst, max_waiting_in_rq, waiting_in_rq) \
		((1 + expected_burst) / (1 + min_expected_burst)) * ((1 + max_waiting_in_rq) / (1 + waiting_in_rq))
