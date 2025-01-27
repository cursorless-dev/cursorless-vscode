#!/bin/bash


# Variable declaration
var="Hello, World"
array=("apple" "banana" "cherry")

# Output variables
echo "String variable: $var"
echo "Number variable: $number"
echo "Array variable: ${array[*]}"
echo A B C
# If statement
if [ "$number" -eq 42 ]; then
  echo "The number is 42"
else
  echo "The number is not 42"
fi

# For loop
for item in "${array[@]}"; do
  echo "Fruit: $item"
done

# While loop
count=0
while [ $count -lt 3 ]; do
  echo "Count: $count"
  ((count++))
done

# Function declaration
my_function() {
  local local_var="Local Variable"
  echo "Function argument: $1"
  echo "$local_var from function"
}

sub_function() (foo)
sub_function() ((foo++))

my_function "Function Argument"

# Case statement
case "$number" in
1)
  echo "Number is 1"
  ;;
2)
  echo "Number is 2"
  ;;
42)
  echo "Number is the answer to everything"
  ;;
*)
  echo "Number is not recognized"
  ;;
esac

# Advanced constructs
# Command substitution
current_date=$(date)

# Conditional execution
ls non_existent_file || echo "File not found"

# Here document
cat <<EOF
This is a
multiline
text block
EOF

# Arithmetic operations
result=$((5 + 3))

echo "Arithmetic result: $result"

# Variable expansion and substitution
string="Hello, World"
substring=${string:0:5}
echo "Substring: $substring"

# Command substitution within a string
current_date="Current date is $(date)"

# Advanced array operations
declare -a arr=("apple" "banana" "cherry")
length=${#arr[@]}
echo "Array length: $length"

# Complex if condition with logical operators
if [[ "$string" == "Hello, World" && "$number" -eq 42 ]]; then
  echo "String and number match"
else
  echo "No match"
fi

# C-style for loop
for ((i = 1; i <= 5; i++)); do
  echo "C-style loop iteration: $i"
done

# Advanced function constructs
recursive_function() {
  local value=$1
  if [ $value -le 0 ]; then
    echo "Done"
  else
    echo "Value: $value"
    recursive_function $((value - 1))
  fi
}

echo "Recursive Function:"
recursive_function 5

# Subshell and variable scope
(subshell_var="I'm in a subshell")
echo "Subshell variable: $subshell_var"
echo "Subshell variable outside the subshell: $subshell_var (should be empty)"

# Command grouping
{
  echo "Command 1"
  echo "Command 2"
}
(
  echo "Command 3"
  echo "Command 4"
)

# Brace expansion
echo "Brace Expansion: {1..5} => "{1..5}

# Extended globbing
shopt -s extglob
files="file1.txt file2.txt file3.log"
echo "Extended Globbing: ${files%%.*(txt|log)}"

# Conditional execution and redirection
false && echo "This won't execute"
true || echo "This will execute"

# Input redirection
cat <input.txt

# Process substitution
diff <(sort file1.txt) <(sort file2.txt)

# Multiline command
long_command="This is a very long command that \
extends over multiple lines for readability."
echo "$long_command"

# Advanced parameter expansion
path="/path/to/some/directory/"
echo "Trimmed Path: ${path%/}"

# Advanced arithmetic operations
value=5
((value++))
echo "Incremented value: $value"

# Array slicing
numbers=(1 2 3 4 5)
sliced_numbers=("${numbers[@]:1:3}")
echo "Sliced array: ${sliced_numbers[*]}"

declare -A arr
arr["key1"]=val1
arr+=(["key2"]=val2 ["key3"]=val3)
