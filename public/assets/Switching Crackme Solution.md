## This the solution write up I made for cat_puzzler's Switching crackme

---
# Solution to cat_puzzler's Switching crackme
[Link](https://crackmes.one/crackme/6784563e4d850ac5f7dc5137)

I used Ghidra for static analysis then came up with a python script to generate keys. Full python code at the end of this file.

## Walkthrough

When running the executable, it asks for an argument for the key. With incorrect keys, the program will return 'Incorrect password' and exit. I opened this in Ghidra, and found the `main` function (I renamed some variables to make it easier to follow):

```c
undefined8 main(int argc,long argv) {
  undefined4 xor_result;
  int sum_result;
  size_t input_len;
  size_t first_not_num;
  long in_FS_OFFSET;
  char nums [10];
  long local_20;
  
  local_20 = *(long *)(in_FS_OFFSET + 0x28);
  if (argc != 2) {
    puts("Usage: ./crackme <key>");
                    /* WARNING: Subroutine does not return */
    exit(-1);
  }
  input_len = strlen(*(char **)(argv + 8));
  if (4 < input_len) {
    input_len = strlen(*(char **)(argv + 8));
    if (input_len < 0xff) goto LAB_00101387;
  }
  error();
LAB_00101387:
  builtin_strncpy(nums,"0123456789",10);
  input_len = strlen(*(char **)(argv + 8));
  first_not_num = strspn(*(char **)(argv + 8),nums);
  if (input_len != first_not_num) {
    error();
  }
  strcpy(&PASS,*(char **)(argv + 8));
  xor_result = check_id_xor();
  sum_result = check_id_sum(xor_result);
  if (sum_result == 0) {
    error();
  }
  puts("The password was correct");
  if (local_20 != *(long *)(in_FS_OFFSET + 0x28)) {
                    /* WARNING: Subroutine does not return */
    __stack_chk_fail();
  }
  return 0;
}
```
Parameter 1 is number of arguments and parameter 2 is where the argument is stored. The program takes only 1 argument, which is the key. The first thing that it does is to check the key length, which needs to be between 4 and 0xff (255 in decimal). Else, we will get `error()` immediately. If the key length is ok, then it will jump to `LAB_00101387`, where the program will perform more checks. 

First, all the numerical numbers gets copied to a `char[]`, then the program uses `strspn` on it with the user input. What this effectively does is returning the index of the character from the user input that is NOT an number. Next, we compare that index with key length; if they are not equal, we get error. This means that the key must be all in numbers.

After that, the program copies the user input into `&PASS`, which will be used in the 2 functions that check the password. Let's look at the first one, `check_id_xor()`:
```c
uint check_id_xor(void) {
  int int_input;
  uint ret;
  size_t input_len;
  
  int_input = (int)PASS;
  input_len = strlen(&PASS);
  ret = int_input - 0x30U ^ (int)(char)(&DAT_0010403f) [input_len] - 0x30U;
  if (((int)ret < (int)(int_input - 0x30U)) ||
     ((int)ret < (int)((int)(char)(&DAT_0010403f)[input_l en] - 0x30U))) {
    ret = 0xffffffff;
  }
  return ret;
}
```
In this function, `PASS` first gets converted to integers. In C, it is based on ASCII; for example, character 'A' will get converted to 65. In the line is where `ret` is calculated, `int_input - 0x30U` basically converts the first character of user input into integer from ASCII. Because '0' in ASCII is 48, or 0x30, so dividing the character by 0x30 returns the actual integer. So, the first part is the first number we put in the key. Next part is the last character of the key converted to int. Because `PASS` is stored at `0x104040`, `0x10403F` is location of `PASS` minus 1; and because length of key is one more than the last index of the key, this combined together effectively points at the last character of the key. Lastly, the function checks if the XOR result between the first and last number in the key are smaller than the first or last number; if it is, then return `0xffffffff`. Although `ret` is uint, if we convert this to int, then it is equal to `-1`. Otherwise, the xor result will be returned and passed onto the next function for checking.
```c
undefined8 check_id_sum(int xor_result)
{
  int num_each_i;
  size_t input_len;
  undefined8 ret;
  int sum_res;
  uint i;
  
  sum_res = 0;
  i = 1;
  while( true ) {
    input_len = strlen(&PASS);
    if (input_len - 1 <= (ulong)(long)(int)i) break;
    if ((i & 1) == 0) {
      num_each_i = -((char)(&PASS)[(int)i] + -0x30);
    }
    else {
      num_each_i = (char)(&PASS)[(int)i] + -0x30;
    }
    sum_res = sum_res + num_each_i;
    i = i + 1;
  }
  if ((sum_res == xor_result) && (xor_result != -1)) {
    ret = 1;
  }
  else {
    ret = 0;
  }
  return ret;
}
```
In this function, we can first follow where the `xor_result` from the last function is used. Here, it is used as `int` rather than `uint`. After the while loop, we can see that another variable, sum_res, has to equal to xor_result, and xor_result can't be -1; else this function will return 0. Looking back at main, if sum_result is 0, the program will go to `error()`. So now we know that to pass the xor check, the xor of first and last number of the key must be greater than both of them. Within the while loop of this function, the first 2 lines checks if `i` is <= key length, and `i` is incremented at the end of while loop; this while loop is going through each index of the key. In the middle of while loop, it checks if `(i & 1)==0`. This is a bit-wise operation, checking if the least significant bit is 1 or zero. This is equivalent to check if the index is odd or even. If it's even, some int that I renamed as `num_each_i` will get set to negative of some operation depended on `PASS`. If it's odd, then it will be positive. The operation is very similar to what we saw in the previous check_xor function, which also has that `-0x30`. It is extracting each number of the key as int, make it negative if it's at an even index. Lastly, we add this into `sum_res`, which needs to equal to `xor_result`. Also note that `i` starts at 1 and goes up to `input_len - 1`. 

If we pass this step, `main()` will put "The password was correct". Regarding the nextline where the variable `local_20` is used, it's used for stack canary protection, which we don't need to care about unless we want to do some buffer overflow attack. Reflecting on the key requirements:
1. Key length must be between 5-254
2. Key must contain only digits (0-9)
3. XOR of first and last numbers of the key must be greater or equal to both first and last numbers
4. From the second to second-to-last number, sum of numbers at odd indexes minus the sum of numbers at even indexes must equal to the XOR result

Given these information, we can write a python script to generate random valid keys.

## Key Generation Script
```python
import random

def gen_key():
    while True:
        k_len = random.randint(5,254)
        k = ''.join(random.choice('0123456789') for i in range(k_len))

        # check xor result
        first_char = int(k[0])
        last_char = int(k[-1])
        xor_res = first_char ^ last_char
        if xor_res < first_char or xor_res < last_char:
            continue

        # check sum
        sum = 0
        for i in range(1, len(k)-1):
            if (i % 2) == 1:
                sum += int(k[i])
            else:
                sum -= int(k[i])

        if sum == xor_res:
            return k

key = gen_key()
print(key)
```
