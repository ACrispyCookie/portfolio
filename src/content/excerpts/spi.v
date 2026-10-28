// ACrispyCookie/ECE333-Digital-Systems-Lab Lab4/part_b/src/spi_master.v@2cd308ca4de39300c2eb230602528e12910e5670 L162-L182
always @(current_state or enable or sclk_counter or bit_counter) begin
    case (current_state)
        IDLE: next_state = (enable && sclk_counter == SHIFT_ON) ? LOAD : IDLE;
        LOAD: next_state = (sclk_counter == SAMPLE_ON) ? SAMPLE : LOAD;
        SAMPLE: next_state = (bit_counter == 3'd7) ? COPY_RECEIVED : SAMPLE_WAIT;
        SAMPLE_WAIT: next_state = (sclk_counter == SHIFT_ON) ? SHIFT : SAMPLE_WAIT;
        SHIFT: next_state = SHIFT_WAIT;
        SHIFT_WAIT: next_state = (sclk_counter == SAMPLE_ON) ? SAMPLE : SHIFT_WAIT;
        COPY_RECEIVED: next_state = DONE;
        DONE: begin
            if (enable && sclk_counter == SHIFT_ON) begin // Continue the next transmission if enable is high
                next_state = LOAD; 
            end else if (sclk_counter == DISABLE_ON) begin // End communication if enable is low and there no time left to start a new transmission
                next_state = IDLE;
            end else begin
                next_state = DONE;
            end
        end
        default: next_state = IDLE;
    endcase
end
