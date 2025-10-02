
# Remove numbered junk files
echo "Removing numbered junk files..."
for file in 159 31 51; do
  if [ -f "$file" ]; then
    echo "Removing: $file"
    rm "$file"
  fi
done
