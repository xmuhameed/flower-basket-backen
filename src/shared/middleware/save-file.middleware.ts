// i mport fs from 'fs';
// import path from 'path';
// export const saveFile = async (nestedFolder: string, file: any) => {
//     const userDir = path.join(process.cwd(), 'uploads', nestedFolder);
//     await fs.promises.mkdir(userDir, { recursive: true });
//     const fileName = `${Date.now()}${path.extname(file.name)}`;
//     await file.mv(path.join(userDir, fileName));
//     return fileName;
// };

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define proper TypeScript interfaces
interface UploadedFile {
	name: string;
	mv: (path: string) => Promise<void>;
	data?: Buffer; // Alternative for different file handling approaches
}

export const saveFile = async (
	nestedFolder: string,
	file: UploadedFile,
	options: {
		prefix?: string;
		sanitize?: boolean;
		allowedExtensions?: string[];
	} = {},
): Promise<{ fileName: string; filePath: string; relativePath: string }> => {
	try {
		// Validate inputs
		if (!nestedFolder || !file) {
			throw new Error('Invalid input parameters');
		}

		// Security: Sanitize folder and filename
		const sanitizedFolder = nestedFolder.replace(/[^a-zA-Z0-9-_/]/g, '');
		const userDir = path.resolve(process.cwd(), 'uploads', sanitizedFolder);

		// Create directory recursively
		await fs.mkdir(userDir, { recursive: true });

		// Sanitize filename
		const sanitizedName = options.sanitize ? file.name.replace(/[^a-zA-Z0-9-_.]/g, '') : file.name;

		// Generate unique filename
		const fileExt = path.extname(sanitizedName);
		const fileBase = path.basename(sanitizedName, fileExt);
		const fileName = `${options.prefix || ''}${fileBase}-${uuidv4()}${fileExt}`;

		// Validate file extension
		if (options.allowedExtensions && !options.allowedExtensions.includes(fileExt.toLowerCase())) {
			throw new Error(`Invalid file extension: ${fileExt}`);
		}

		const fullPath = path.join(userDir, fileName);

		// Save file
		if (file.mv) {
			// express-fileupload style
			await file.mv(fullPath);
		} else if (file.data) {
			// Buffer style
			await fs.writeFile(fullPath, file.data);
		} else {
			throw new Error('Unsupported file format');
		}

		return {
			fileName,
			filePath: fullPath,
			relativePath: path.join(sanitizedFolder, fileName),
		};
	} catch (error) {
		// Add error logging here
		throw new Error(`File save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
};

export const deleteFile = async (filePath: string): Promise<boolean> => {
	try {
		// Validate input
		if (!filePath) {
			throw new Error('File path is required');
		}

		// Ensure the path is within the uploads directory for security
		const fullPath = path.resolve(process.cwd(), 'uploads', filePath);
		const uploadsDir = path.resolve(process.cwd(), 'uploads');

		if (!fullPath.startsWith(uploadsDir)) {
			throw new Error('Invalid file path: Access denied');
		}

		// Check if file exists
		try {
			await fs.access(fullPath);
		} catch {
			throw new Error('File does not exist');
		}

		// Delete the file
		await fs.unlink(fullPath);
		return true;
	} catch (error) {
		throw new Error(`File deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
};
