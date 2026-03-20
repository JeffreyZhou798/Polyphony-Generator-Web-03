import * as mm from '@magenta/music';
import type { INoteSequence } from '@magenta/music';
import JSZip from 'jszip';

export class MusicXMLParser {
  async parseFile(file: File): Promise<INoteSequence> {
    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.mxl')) {
        return await this.parseMXL(file);
      } else if (fileName.endsWith('.musicxml') || fileName.endsWith('.xml')) {
        return await this.parseMusicXML(file);
      } else {
        throw new Error('不支持的文件格式');
      }
    } catch (error) {
      console.error('解析文件失败:', error);
      throw new Error('文件解析失败，请确保文件格式正确');
    }
  }

  private async parseMXL(file: File): Promise<INoteSequence> {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);

    // 查找 MusicXML 文件
    let musicXMLFile: JSZip.JSZipObject | null = null;

    zipContent.forEach((relativePath, zipFile) => {
      if (relativePath.endsWith('.xml') || relativePath.endsWith('.musicxml')) {
        musicXMLFile = zipFile;
      }
    });

    if (!musicXMLFile) {
      throw new Error('MXL 文件中未找到 MusicXML 内容');
    }

    const xmlContent = await (musicXMLFile as JSZip.JSZipObject).async('string');
    return this.parseXMLString(xmlContent);
  }

  private async parseMusicXML(file: File): Promise<INoteSequence> {
    const xmlContent = await file.text();
    return this.parseXMLString(xmlContent);
  }

  private parseXMLString(xmlString: string): INoteSequence {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // 检查解析错误
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML 解析错误');
    }

    // 提取音符信息
    const notes: mm.NoteSequence.Note[] = [];
    const noteElements = xmlDoc.querySelectorAll('note');

    let currentTime = 0;
    const divisions = this.getDivisions(xmlDoc);
    const tempo = this.getTempo(xmlDoc);
    const stepsPerQuarter = 4; // 每拍4步

    noteElements.forEach((noteElement) => {
      // 跳过休止符
      if (noteElement.querySelector('rest')) {
        const duration = this.getDuration(noteElement, divisions);
        currentTime += duration;
        return;
      }

      const pitch = this.getPitch(noteElement);
      const duration = this.getDuration(noteElement, divisions);
      const velocity = this.getVelocity(noteElement);

      if (pitch !== null) {
        const quantizedStartStep = Math.round(currentTime * stepsPerQuarter);
        const quantizedEndStep = Math.round((currentTime + duration) * stepsPerQuarter);
        
        notes.push({
          pitch,
          startTime: currentTime,
          endTime: currentTime + duration,
          velocity,
          quantizedStartStep,
          quantizedEndStep,
          isDrum: false
        } as any);
      }

      // 检查是否是和弦音符
      if (!noteElement.querySelector('chord')) {
        currentTime += duration;
      }
    });

    const totalTime = currentTime;
    const totalQuantizedSteps = Math.round(totalTime * stepsPerQuarter);

    return {
      notes,
      totalTime,
      totalQuantizedSteps,
      quantizationInfo: {
        stepsPerQuarter
      },
      tempos: [{ time: 0, qpm: tempo }],
      timeSignatures: [{ time: 0, numerator: 4, denominator: 4 }]
    };
  }

  private getDivisions(xmlDoc: Document): number {
    const divisionsElement = xmlDoc.querySelector('divisions');
    return divisionsElement ? parseInt(divisionsElement.textContent || '1') : 1;
  }

  private getTempo(xmlDoc: Document): number {
    const tempoElement = xmlDoc.querySelector('sound[tempo]');
    return tempoElement ? parseFloat(tempoElement.getAttribute('tempo') || '120') : 120;
  }

  private getPitch(noteElement: Element): number | null {
    const pitchElement = noteElement.querySelector('pitch');
    if (!pitchElement) return null;

    const step = pitchElement.querySelector('step')?.textContent || 'C';
    const octave = parseInt(pitchElement.querySelector('octave')?.textContent || '4');
    const alter = parseInt(pitchElement.querySelector('alter')?.textContent || '0');

    const stepToMidi: { [key: string]: number } = {
      'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
    };

    const basePitch = stepToMidi[step] || 0;
    return (octave + 1) * 12 + basePitch + alter;
  }

  private getDuration(noteElement: Element, divisions: number): number {
    const durationElement = noteElement.querySelector('duration');
    const duration = durationElement ? parseInt(durationElement.textContent || '0') : 0;
    return duration / divisions;
  }

  private getVelocity(noteElement: Element): number {
    const dynamicsElement = noteElement.querySelector('dynamics');
    if (dynamicsElement) {
      const dynamic = dynamicsElement.textContent?.toLowerCase();
      const velocityMap: { [key: string]: number } = {
        'ppp': 20, 'pp': 40, 'p': 60, 'mp': 70, 'mf': 80, 'f': 90, 'ff': 100, 'fff': 110
      };
      return velocityMap[dynamic || 'mf'] || 80;
    }
    return 80;
  }
}

export const musicXMLParser = new MusicXMLParser();
