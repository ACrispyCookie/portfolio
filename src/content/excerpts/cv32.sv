// TsiantosD/cv32e40p rtl/cv32e40p_controller.sv@687d3af6cff5c18ea9ea5af965585f8d6f0d1d38 L1366-L1375
    // Stall one cycle for consumers of a MUL result. MUL results are registered
    // into the EX/WB stage and are only available for forwarding from WB.
    if ((mult_en_ex_i == 1'b1) && (regfile_alu_we_ex_i == 1'b1) &&
        ((reg_d_alu_is_reg_a_i == 1'b1) ||
         (reg_d_alu_is_reg_b_i == 1'b1) ||
         (reg_d_alu_is_reg_c_i == 1'b1)))
    begin
      deassert_we_o   = 1'b1;
      load_stall_o    = 1'b1;
    end
