import jsPDF from 'jspdf';

export const generateSummaryPDF = (summary: string, keyPoints: string[], minuteByMinute: string[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25.4; // 1 inch margins
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('Video Summary Report', margin, yPosition);
  yPosition += 4;
  
  // Underline
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 12;

  // Overall Summary Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Overall Summary', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  const summaryLines = doc.splitTextToSize(summary, maxWidth);
  doc.text(summaryLines, margin, yPosition);
  yPosition += summaryLines.length * 6 + 12;

  // Minute-by-Minute Breakdown Section
  if (minuteByMinute && minuteByMinute.length > 0) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Minute-by-Minute Breakdown', margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    minuteByMinute.forEach((minute, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }
      const minuteLines = doc.splitTextToSize(`• ${minute}`, maxWidth - 5);
      doc.text(minuteLines, margin + 5, yPosition);
      yPosition += minuteLines.length * 6 + 5;
    });
    yPosition += 8;
  }

  // Key Points Section
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Key Points', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  keyPoints.forEach((point, index) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }
    const pointText = `${index + 1}. ${point}`;
    const pointLines = doc.splitTextToSize(pointText, maxWidth - 5);
    doc.text(pointLines, margin + 5, yPosition);
    yPosition += pointLines.length * 6 + 5;
  });

  doc.save('video-summary.pdf');
};

export const generateAssessmentPDF = (
  mcqs: any[],
  shortAnswers: any[],
  mcqAnswers: Record<number, number>,
  shortAnswerTexts: Record<number, string>,
  score: number,
  submitted: boolean
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25.4; // 1 inch margins
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('Video Assessment Report', margin, yPosition);
  yPosition += 4;
  
  // Underline
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 12;

  if (submitted) {
    // Score Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Final Score: ${score.toFixed(1)}%`, margin, yPosition);
    yPosition += 12;
  }

  // MCQs
  if (mcqs.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Multiple Choice Questions', margin, yPosition);
    yPosition += 10;

    mcqs.forEach((mcq, index) => {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = margin;
      }

      // Question
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const questionLines = doc.splitTextToSize(`Question ${index + 1}: ${mcq.question}`, maxWidth);
      doc.text(questionLines, margin, yPosition);
      yPosition += questionLines.length * 6 + 6;

      // Options
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      mcq.options.forEach((option: string, optIndex: number) => {
        const isUserAnswer = mcqAnswers[index] === optIndex;
        const isCorrect = mcq.correctAnswer === optIndex;
        
        let prefix = '';
        let textStyle = 'normal';
        if (submitted) {
          if (isCorrect && isUserAnswer) {
            doc.setTextColor(0, 128, 0);
            prefix = '✓ ';
            textStyle = 'bold';
          } else if (isCorrect && !isUserAnswer) {
            doc.setTextColor(0, 128, 0);
            prefix = '✓ (Correct Answer) ';
            textStyle = 'bold';
          } else if (isUserAnswer && !isCorrect) {
            doc.setTextColor(200, 0, 0);
            prefix = '✗ (Your Answer) ';
          } else {
            doc.setTextColor(60, 60, 60);
          }
        } else {
          doc.setTextColor(60, 60, 60);
          if (isUserAnswer) {
            prefix = '(Your Answer) ';
            textStyle = 'bold';
          }
        }

        doc.setFont('helvetica', textStyle);
        const optionText = `   ${prefix}${String.fromCharCode(65 + optIndex)}. ${option}`;
        const optionLines = doc.splitTextToSize(optionText, maxWidth - 5);
        doc.text(optionLines, margin, yPosition);
        yPosition += optionLines.length * 6 + 3;
      });

      if (submitted && mcq.explanation) {
        yPosition += 2;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(11);
        doc.setTextColor(70, 70, 70);
        const explanationLines = doc.splitTextToSize(`   Explanation: ${mcq.explanation}`, maxWidth - 5);
        doc.text(explanationLines, margin, yPosition);
        yPosition += explanationLines.length * 5 + 8;
      } else {
        yPosition += 6;
      }
    });
  }

  // Short Answers
  if (shortAnswers.length > 0) {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Short Answer Questions', margin, yPosition);
    yPosition += 10;

    shortAnswers.forEach((sa, index) => {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = margin;
      }

      // Question
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const questionLines = doc.splitTextToSize(`Question ${index + 1}: ${sa.question}`, maxWidth);
      doc.text(questionLines, margin, yPosition);
      yPosition += questionLines.length * 6 + 6;

      // Answer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      const userAnswerText = shortAnswerTexts[index] || 'No answer provided';
      const userAnswerLines = doc.splitTextToSize(`Your Answer: ${userAnswerText}`, maxWidth - 5);
      doc.text(userAnswerLines, margin, yPosition);
      yPosition += userAnswerLines.length * 6 + 10;
    });
  }

  doc.save('video-assessment.pdf');
};

export const generateQAPDF = (messages: { role: string; content: string }[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25.4; // 1 inch margins
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('Q&A Session Report', margin, yPosition);
  yPosition += 4;
  
  // Underline
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 12;

  messages.forEach((message, index) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    // Role label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    if (message.role === 'user') {
      doc.text('Question:', margin, yPosition);
    } else {
      doc.text('Answer:', margin, yPosition);
    }
    yPosition += 7;

    // Content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    const contentLines = doc.splitTextToSize(message.content, maxWidth);
    doc.text(contentLines, margin, yPosition);
    yPosition += contentLines.length * 6 + 10;
  });

  doc.save('video-qa.pdf');
};
