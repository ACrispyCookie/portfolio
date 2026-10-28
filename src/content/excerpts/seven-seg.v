// ACrispyCookie/ECE333-Digital-Systems-Lab Lab1/part_b/AnodeDecoder.v@2cd308ca4de39300c2eb230602528e12910e5670 L1-L20
module AnodeDecoder(input [3:0] counter, output reg an0, output reg an1, output reg an2, output reg an3);
    parameter AN0_OFF = 4'b0010;
    parameter AN1_OFF = 4'b0110;
    parameter AN2_OFF = 4'b1010;
    parameter AN3_OFF = 4'b1110;

    always @(counter) begin
        case (counter)
            AN0_OFF: begin
                an0 = 1'b0;
                an1 = 1'b1;
                an2 = 1'b1;
                an3 = 1'b1;
            end
            AN1_OFF: begin
                an0 = 1'b1;
                an1 = 1'b0;
                an2 = 1'b1;
                an3 = 1'b1;
            end
