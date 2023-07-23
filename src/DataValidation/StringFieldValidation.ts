export const StringIsEmptyOrTooLong = (valueForCheck: string, maxLength: number): boolean => {
    if(!valueForCheck || !valueForCheck.length || valueForCheck.trim().length > maxLength) 
        return true;
    
    return false;
}