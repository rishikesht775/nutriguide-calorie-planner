"""Build the maintained Word snapshot. Requires python-docx and Graphviz."""
from pathlib import Path
import re, subprocess
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/exports';OUT.mkdir(parents=True,exist_ok=True)
subprocess.run(['node',str(ROOT/'scripts/update-docs.mjs'),'--check'],cwd=ROOT,check=True)
subprocess.run(['dot','-Tpng','-Gdpi=160',str(ROOT/'docs/assets/architecture.dot'),'-o',str(OUT/'architecture.png')],check=True)
doc=Document();sec=doc.sections[0];sec.top_margin=sec.bottom_margin=Inches(.7);sec.left_margin=sec.right_margin=Inches(.75)
sec.page_width=Inches(8.27);sec.page_height=Inches(11.69)
for name in ['Normal','Title','Subtitle','Heading 1','Heading 2','Heading 3']:
 s=doc.styles[name];s.font.name='Calibri';s.font.color.rgb=RGBColor(0,0,0)
s=doc.styles['Normal'];s.font.size=Pt(10.5);s.paragraph_format.space_after=Pt(6);s.paragraph_format.line_spacing=1.1
for name,size in [('Title',27),('Heading 1',18),('Heading 2',13),('Heading 3',11)]:
 s=doc.styles[name];s.font.size=Pt(size);s.paragraph_format.space_before=Pt(15);s.paragraph_format.space_after=Pt(8);s.paragraph_format.keep_with_next=True
# Remove decorative borders inherited from the Word default template.
for st in doc.styles:
 for border in list(st.element.iter(qn('w:pBdr'))):border.getparent().remove(border)
# A compact footer supplies navigation in this long technical reference.
p=sec.footer.paragraphs[0];p.alignment=WD_ALIGN_PARAGRAPH.RIGHT
r=p.add_run('NutriGuide | ');r.font.size=Pt(8)
f=OxmlElement('w:fldSimple');f.set(qn('w:instr'),'PAGE');p._p.append(f)
def inline(p,text):
 for i,part in enumerate(re.split(r'(`[^`]+`|\*\*[^*]+\*\*)',text)):
  r=p.add_run(part.strip('`') if part.startswith('`') else part.strip('*') if part.startswith('**') else part)
  if part.startswith('`'):r.font.name='Consolas';r.font.size=Pt(9)
  if part.startswith('**'):r.bold=True

def table(lines):
 rows=[[x.strip() for x in l.strip().strip('|').split('|')] for l in lines]
 rows=[r for r in rows if not all(re.fullmatch(r':?-+:?',x.replace(' ','')) for x in r)]
 n=len(rows[0]);t=doc.add_table(rows=1,cols=n);t.alignment=WD_TABLE_ALIGNMENT.CENTER;t.autofit=False
 widths=([.7,2.15,3.85] if n==3 and rows[0][0]=='ID' else [1.55,2.35,2.8] if n==3 else [2.2,4.5] if n==2 else [6.7/n]*n)
 for col,w in zip(t.columns,widths):col.width=Inches(w)
 for idx,data in enumerate(rows):
  cells=t.rows[0].cells if idx==0 else t.add_row().cells
  for j,c in enumerate(cells):
   c.width=Inches(widths[j]);c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
   p=c.paragraphs[0];p.paragraph_format.space_after=Pt(4);p.paragraph_format.space_before=Pt(4);p.paragraph_format.line_spacing=1.05
   inline(p,data[j] if j<len(data) else '')
   for r in p.runs:r.font.size=Pt(9)
   if idx==0:
    for r in p.runs:r.bold=True;r.font.color.rgb=RGBColor(255,255,255)
   tcPr=c._tc.get_or_add_tcPr();shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'3D4146' if idx==0 else 'F3F5F4' if idx%2 else 'FFFFFF');tcPr.append(shade)
   mar=OxmlElement('w:tcMar')
   for side in ['top','left','bottom','right']:
    e=OxmlElement('w:'+side);e.set(qn('w:w'),'85');e.set(qn('w:type'),'dxa');mar.append(e)
   tcPr.append(mar)
  trPr=t.rows[idx]._tr.get_or_add_trPr();avoid=OxmlElement('w:cantSplit');trPr.append(avoid)
  if idx==0:
   repeat=OxmlElement('w:tblHeader');trPr.append(repeat)
 props=t._tbl.tblPr;borders=OxmlElement('w:tblBorders')
 for side in ['top','left','bottom','right','insideH','insideV']:
  e=OxmlElement('w:'+side);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'4');e.set(qn('w:color'),'D9D9D9');borders.append(e)
 props.append(borders);doc.add_paragraph().paragraph_format.space_after=Pt(2)

def markdown(path,appendix=False):
 lines=path.read_text().splitlines();i=0;code=False
 while i<len(lines):
  l=lines[i].strip();i+=1
  if not l:continue
  if l.startswith('```'):code=not code;continue
  if code:
   p=doc.add_paragraph();p.paragraph_format.space_after=Pt(2);r=p.add_run(l);r.font.name='Consolas';r.font.size=Pt(9);continue
  if l.startswith('|'):
   chunk=[l]
   while i<len(lines) and lines[i].strip().startswith('|'):chunk.append(lines[i].strip());i+=1
   table(chunk);continue
  if l.startswith('!['):
   p=doc.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.add_run().add_picture(str(OUT/'architecture.png'),width=Inches(6.5));continue
  if l.startswith('# '):
   p=doc.add_paragraph(l[2:],'Heading 1' if appendix else 'Title');continue
  if l.startswith('## '):doc.add_paragraph(l[3:],'Heading 1');continue
  if l.startswith('### '):doc.add_paragraph(l[4:],'Heading 2');continue
  if l.startswith('- '):p=doc.add_paragraph(style='List Bullet');inline(p,l[2:]);continue
  if re.match(r'^\d+\. ',l):p=doc.add_paragraph(style='List Number');inline(p,re.sub(r'^\d+\. ','',l));continue
  p=doc.add_paragraph();inline(p,l)
markdown(ROOT/'docs/APPLICATION.md')
p=doc.add_paragraph();p.paragraph_format.page_break_before=True;doc.add_heading('Appendix Source Inventory',0);markdown(ROOT/'docs/GENERATED-INVENTORY.md',True)
doc.core_properties.title='NutriGuide Application Architecture and Requirements';doc.core_properties.author='NutriGuide';doc.core_properties.subject='Maintained application requirements and architecture'
path=OUT/'NutriGuide-Application-Architecture-and-Requirements.docx';doc.save(path);print(path)
