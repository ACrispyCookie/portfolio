// ACrispyCookie/ECE333-Digital-Systems-Lab Lab3/src/part_a/pixel_controller.v@2cd308ca4de39300c2eb230602528e12910e5670 L38-L56
    always @(current_address or hpixel_upscale_counter) begin
        if (current_address[3:0] == 4'b1111 && hpixel_upscale_counter == UPSCALE_CYCLES) begin
            vram_address = current_address + 1'b1;
        end else begin
            vram_address = current_address;
        end
    end

    always @(rgb_enabled or vram_red or vram_green or vram_blue or current_address) begin
        if (!rgb_enabled) begin
            r = 1'b0;
            g = 1'b0;
            b = 1'b0;
        end else begin
            r = vram_red[current_address[3:0]];
            g = vram_green[current_address[3:0]];
            b = vram_blue[current_address[3:0]];
        end
    end
