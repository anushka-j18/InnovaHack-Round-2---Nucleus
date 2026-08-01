import os
import zipfile
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("nucleus.packager")

def zip_project():
    zip_name = "nucleus_submission.zip"
    exclude_dirs = {".git", "venv", ".pytest_cache", "__pycache__", "cache", "scratch"}
    exclude_files = {".env", zip_name}
    
    logger.info(f"Creating submission package archive: {zip_name}...")
    
    count = 0
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to prune excluded directories from search recursion
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith("__pycache__")]
            
            for file in files:
                # Exclude environment configuration and logging/document files
                if file in exclude_files:
                    continue
                if file.endswith('.log') or file.endswith('.pdf') or file.endswith('.pyc'):
                    continue
                    
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, '.')
                zipf.write(file_path, arcname)
                logger.info(f"  + Included: {arcname}")
                count += 1
                
    logger.info(f"SUCCESS: Package created with {count} files. Excluded .env, venv, and cache folders.")

if __name__ == "__main__":
    zip_project()
