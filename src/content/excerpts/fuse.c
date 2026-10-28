// ACrispyCookie/ECE318-Operating-Systems Project3/final/filesystem/fs_manager.c@fc0be06d24cb4ccfb9e6a19f341ebae7d8031323 L344-L359
int remove_reference_from_block(const unsigned char hash[HASH_SIZE]) 
{
    blocks_hash_element_t *element = blocks_table_find(blocks_metadata, hash);
    if (element == NULL)
        return BLOCK_NOT_FOUND;
    
    if (element->ref_count == 0)
        return ERROR;
    
    element->ref_count--;
    if (element->ref_count == 0)
        remove_block(hash);

    return BLOCK_FOUND;
}

