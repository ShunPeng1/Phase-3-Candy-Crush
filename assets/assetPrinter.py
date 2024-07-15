import os

# Step 2: Define the directory
directory = "./assets/candy-crush/ui"

# Step 3: List files in the directory
files = os.listdir(directory)

# Step 4: Filter for PNG files
png_files = [file for file in files if file.endswith('.png')]

# Step 5 & 6: Generate and print the desired text and rename files
for file in png_files:
    key = file.split('.')[0]  # Remove the file extension to get the key
    key_with_dashes = key.replace("_", "-")  # Replace underscores with dashes
    new_file_name = key_with_dashes + ".png"  # Construct new file name with dashes
    print(f"""      {{
        "type": "image",
        "key": "{key_with_dashes}",
        "url": "{directory}/{new_file_name}"
      }},""")
    
    # Rename the file
    os.rename(os.path.join(directory, file), os.path.join(directory, new_file_name))