import { NextRequest, NextResponse } from 'next/server';
import { pdf } from 'pdf-parse';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF
    const data = await pdf(buffer);

    // Generate a unique ID for this PDF
    const pdfId = `pdf_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Structure the response similar to transcript format
    const response = {
      success: true,
      pdf: {
        id: pdfId,
        title: file.name.replace('.pdf', ''),
        fileName: file.name,
        pageCount: (data as any).numpages || 0,
      },
      content: {
        text: data.text,
        // Split into segments for easier processing (by paragraph or page)
        segments: data.text
          .split('\n\n')
          .filter((text: string) => text.trim().length > 0)
          .map((text: string, index: number) => ({
            text: text.trim(),
            index,
          })),
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
