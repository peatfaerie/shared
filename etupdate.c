#include <stdio.h>
#include <stdlib.h>
#include <string.h>

uint32_t float_to_le(float value) {
    union {
        float f;
        uint32_t u;
    } temp;
    temp.f = value;
    temp.u = ((temp.u & 0xFF) << 24) | (((temp.u >> 8) & 0xFF) << 16) | (((temp.u >> 16) & 0xFF) << 8) | ((temp.u >> 24) & 0xFF);
    return temp.u;
}

int main(int argc, char *argv[]) {
    if ((argc < 4 || argc > 5)) {
	    printf("Updates EveryTile's settings with new values\n");
        printf("Usage: %s <lat.value> <lon.value> <string> [filename]\n", argv[0]);
        return 1;
    }

    long strpos = 0x00000048;
    long lonpos = 0x00000a88;
    long latpos = 0x00000a9c;

    float latval = atof(argv[1]);
    float lonval = atof(argv[2]);
    char *strval = argv[3];
    char *filename = (argc == 5) ? argv[4] : "D8NJ2203.SET";

    uint32_t le_latval = float_to_le(latval);
    uint32_t le_lonval = float_to_le(lonval);

    FILE *file = fopen(filename, "r+b");
    if (file == NULL) {
        perror("File open error");
        return 1;
    }

    if (fseek(file, strpos, SEEK_SET) != 0) {
        perror("File seek error for lat pos");
        fclose(file);
        return 1;
    }

    if (fwrite(strval, sizeof(char), strlen(strval), file) != strlen(strval)) {
        perror("File write error");
        fclose(file);
        return 1;
    }

    if (fseek(file, latpos, SEEK_SET) != 0) {
        perror("File seek error for lat pos");
        fclose(file);
        return 1;
    }
    
    if (fwrite(&le_latval, sizeof(uint32_t), 1, file) != 1) {
        perror("File write error for lat");
        fclose(file);
        return 1;
    }

    if (fseek(file, lonpos, SEEK_SET) != 0) {
        perror("File seek error for lon pos");
        fclose(file);
        return 1;
    }   
    
    if (fwrite(&le_lonval, sizeof(uint32_t), 1, file) != 1) {
        perror("File write error for lon");
        fclose(file);
        return 1;
    }

    fclose(file);
    return 0;
}

