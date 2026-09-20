"""Builds downloads/the-5-star-playbook.pdf (the free guide offered on the site).

    pip install reportlab
    python tools/build-playbook.py

Edit the copy in the `story` section below and re-run to regenerate the PDF.
"""
import math
import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (BaseDocTemplate, Flowable, Frame, KeepTogether, PageBreak, PageTemplate,
                                Paragraph, Spacer, Table, TableStyle)

W, H = letter
NAVY = colors.HexColor('#0b2240')
BLUE = colors.HexColor('#0e6fdb')
TEAL = colors.HexColor('#10b0a2')
MUTED = colors.HexColor('#526884')
LINE = colors.HexColor('#d5e2f3')
TINT = colors.HexColor('#eef5ff')
GOLD = colors.HexColor('#f5a524')
SITE = 'reviewdominators.com'
BOOK_URL = 'https://reviewdominators.vercel.app/book-call.html'

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'downloads', 'the-5-star-playbook.pdf')
os.makedirs(os.path.dirname(OUT), exist_ok=True)

# ---------- type ----------
base = ParagraphStyle('base', fontName='Helvetica', fontSize=10.6, leading=16, textColor=NAVY, alignment=TA_LEFT)
H1 = ParagraphStyle('H1', parent=base, fontName='Helvetica-Bold', fontSize=27, leading=31, spaceAfter=10, textColor=NAVY)
H2 = ParagraphStyle('H2', parent=base, fontName='Helvetica-Bold', fontSize=14.5, leading=19, spaceBefore=14, spaceAfter=5, textColor=BLUE)
EYEBROW = ParagraphStyle('EYE', parent=base, fontName='Helvetica-Bold', fontSize=8.5, leading=12, textColor=TEAL, spaceAfter=6)
LEAD = ParagraphStyle('LEAD', parent=base, fontSize=12.6, leading=19, textColor=MUTED, spaceAfter=10)
BODY = ParagraphStyle('BODY', parent=base, spaceAfter=7)
SMALL = ParagraphStyle('SMALL', parent=base, fontSize=8.8, leading=13, textColor=MUTED)
QUOTE = ParagraphStyle('QUOTE', parent=base, fontName='Helvetica-Oblique', fontSize=10.6, leading=16, textColor=NAVY)
LABEL = ParagraphStyle('LABEL', parent=base, fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=BLUE)
BUL = ParagraphStyle('BUL', parent=base, leftIndent=14, bulletIndent=2, spaceAfter=3.5)


def P(text, style=BODY):
    return Paragraph(text, style)


def bullets(items):
    return [Paragraph(t, BUL, bulletText='•') for t in items]


def star_path(c, cx, cy, R, r):
    p = c.beginPath()
    for i in range(10):
        a = math.pi / 2 + i * math.pi / 5
        d = R if i % 2 == 0 else r
        x, y = cx + math.cos(a) * d, cy + math.sin(a) * d
        p.moveTo(x, y) if i == 0 else p.lineTo(x, y)
    p.close()
    return p


def draw_crown(c, x, y, s, fill):
    """Crown-and-star mark, s = width in points, (x, y) = bottom-left."""
    k = s / 32.0
    c.saveState()
    c.translate(x, y)
    c.scale(k, k)
    c.setFillColor(fill)
    p = c.beginPath()
    for i, (px, py) in enumerate([(4.6, 8.6), (2.8, 21), (9.7, 15.9), (16, 26.6), (22.3, 15.9), (29.2, 21), (27.4, 8.6)]):
        p.moveTo(px, py) if i == 0 else p.lineTo(px, py)
    p.close()
    c.drawPath(p, stroke=0, fill=1)
    c.roundRect(5, 3.2, 22, 3.4, 1.5, stroke=0, fill=1)
    for cx, cy, r in [(2.6, 22.4, 1.7), (16, 28, 2), (29.4, 22.4, 1.7)]:
        c.circle(cx, cy, r, stroke=0, fill=1)
    c.setFillColor(BLUE)
    c.drawPath(star_path(c, 16, 14.8, 3.9, 1.65), stroke=0, fill=1)
    c.restoreState()


class Box(Flowable):
    """Empty checkbox for the action plan."""
    def __init__(self, size=9):
        super().__init__(); self.size = size; self.width = size + 2; self.height = size + 2

    def draw(self):
        self.canv.setStrokeColor(BLUE); self.canv.setLineWidth(1.2); self.canv.setFillColor(colors.white)
        self.canv.roundRect(1, 2, self.size, self.size, 2, stroke=1, fill=1)


def checklist(items):
    rows = [[Box(), P(t, ParagraphStyle('c', parent=base, spaceAfter=0))] for t in items]
    t = Table(rows, colWidths=[16, None])
    t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('TOPPADDING', (0, 0), (-1, -1), 3.5),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5), ('LEFTPADDING', (0, 0), (-1, -1), 0),
                           ('LINEBELOW', (0, 0), (-1, -2), 0.4, LINE)]))
    return t


def callout(title, body, accent=BLUE):
    inner = [P(title.upper(), LABEL), Spacer(1, 3)] + ([P(body, base)] if isinstance(body, str) else body)
    t = Table([[inner]], colWidths=[W - 2.3 * inch])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), TINT), ('LINEBEFORE', (0, 0), (0, -1), 3, accent),
                           ('LEFTPADDING', (0, 0), (-1, -1), 13), ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                           ('TOPPADDING', (0, 0), (-1, -1), 10), ('BOTTOMPADDING', (0, 0), (-1, -1), 10)]))
    return t


def script(label, text):
    return callout(label, [P(text, QUOTE)], accent=TEAL)


def step_head(num, title):
    t = Table([[P(f'<font color="#ffffff"><b>{num}</b></font>', ParagraphStyle('n', parent=base, alignment=1, fontSize=13)),
                P(f'<b>{title}</b>', ParagraphStyle('t', parent=base, fontSize=17, leading=21, textColor=NAVY))]],
              colWidths=[32, None], rowHeights=[32])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (0, 0), BLUE), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                           ('LEFTPADDING', (1, 0), (1, 0), 12), ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0)]))
    return t


# ---------- pages ----------
def cover(c, doc):
    c.saveState()
    c.linearGradient(0, 0, W, H, [colors.HexColor('#0b3a7a'), colors.HexColor('#0e6fdb'), colors.HexColor('#10a59a')], [0, 0.6, 1])
    c.rect(0, 0, W, H, stroke=0, fill=0)
    # big soft crown watermark
    c.setFillColor(colors.Color(1, 1, 1, alpha=0.07))
    draw_crown(c, W - 5.4 * inch, -0.6 * inch, 6.6 * inch, colors.Color(1, 1, 1, alpha=0.08))
    # brand
    c.setFillColor(colors.white)
    c.roundRect(0.85 * inch, H - 1.55 * inch, 0.62 * inch, 0.62 * inch, 0.18 * inch, stroke=0, fill=1)
    draw_crown(c, 0.95 * inch, H - 1.45 * inch, 0.42 * inch, BLUE)
    c.setFont('Helvetica-Bold', 14); c.setFillColor(colors.white)
    c.drawString(1.62 * inch, H - 1.2 * inch, 'Review Dominators')
    c.setFont('Helvetica-Bold', 7.5); c.setFillColor(colors.Color(1, 1, 1, alpha=0.75))
    c.drawString(1.62 * inch, H - 1.38 * inch, 'HOME-SERVICE GROWTH')
    # stars
    c.setFillColor(GOLD)
    for i in range(5):
        c.drawPath(star_path(c, 1.0 * inch + i * 0.42 * inch, H - 3.25 * inch, 0.17 * inch, 0.075 * inch), stroke=0, fill=1)
    # title
    c.setFillColor(colors.white)
    c.setFont('Helvetica-Bold', 54); c.drawString(0.85 * inch, H - 4.55 * inch, 'The 5-Star')
    c.drawString(0.85 * inch, H - 5.35 * inch, 'Playbook')
    c.setFont('Helvetica', 15.5); c.setFillColor(colors.Color(1, 1, 1, alpha=0.92))
    c.drawString(0.85 * inch, H - 6.05 * inch, 'How home-service businesses win more Google reviews,')
    c.drawString(0.85 * inch, H - 6.32 * inch, 'rank higher in the map pack and book more jobs.')
    c.setFont('Helvetica-Bold', 9); c.setFillColor(colors.Color(1, 1, 1, alpha=0.8))
    c.drawString(0.85 * inch, 0.85 * inch, f'A FREE GUIDE FROM REVIEW DOMINATORS  ·  {SITE.upper()}')
    c.restoreState()


def inner(c, doc):
    c.saveState()
    c.setStrokeColor(LINE); c.setLineWidth(0.6)
    c.line(1.15 * inch, H - 0.72 * inch, W - 1.15 * inch, H - 0.72 * inch)
    c.setFont('Helvetica-Bold', 8); c.setFillColor(MUTED)
    c.drawString(1.15 * inch, H - 0.6 * inch, 'THE 5-STAR PLAYBOOK')
    c.setFont('Helvetica', 8)
    c.drawRightString(W - 1.15 * inch, H - 0.6 * inch, 'Review Dominators')
    c.setFillColor(BLUE)
    draw_crown(c, 1.15 * inch, 0.42 * inch, 0.2 * inch, BLUE)
    c.setFillColor(MUTED); c.setFont('Helvetica', 8)
    c.drawString(1.5 * inch, 0.47 * inch, SITE)
    c.drawRightString(W - 1.15 * inch, 0.47 * inch, str(doc.page))
    c.restoreState()


doc = BaseDocTemplate(OUT, pagesize=letter, leftMargin=1.15 * inch, rightMargin=1.15 * inch, topMargin=1.05 * inch, bottomMargin=0.95 * inch,
                      title='The 5-Star Playbook', author='Review Dominators', subject='A free guide to Google reviews, local rankings and booked jobs for home-service businesses',
                      creator='Review Dominators')
frame = Frame(doc.leftMargin, doc.bottomMargin, W - 2.3 * inch, H - 2.0 * inch, id='f', leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
cover_frame = Frame(0.85 * inch, 0.5 * inch, W - 1.7 * inch, 0.4 * inch, id='cf')
doc.addPageTemplates([PageTemplate(id='cover', frames=[cover_frame], onPage=cover, autoNextPageTemplate='inner'),
                      PageTemplate(id='inner', frames=[frame], onPage=inner)])

story = [Spacer(1, 1), PageBreak()]

# --- intro ---
story += [P('START HERE', EYEBROW), P('Why the business with the most stars gets the call', H1),
          P('When a water heater dies at 7pm or the AC quits in July, people do not browse. They search Google, look at the map, glance at the stars and call the first business that looks trustworthy. '
            'Most of the time they never scroll to the second page.', LEAD),
          P('That is good news. It means the fastest way to grow a service business is not a clever slogan or a bigger ad budget. It is a simple system that keeps <b>fresh, honest, five-star reviews</b> flowing in, '
            'keeps your Google profile sharp and makes it effortless for a customer to call or book.', BODY),
          P('This playbook walks through that system in four steps, then gives you a 30-day plan to put it in place. Everything here works whether you are a solo owner-operator or run several crews.', BODY),
          Spacer(1, 6),
          callout('The system in one line', 'Ask at the right moment, make leaving a review take ten seconds, answer every review, and keep your profile complete. Repeat every week.'),
          Spacer(1, 10), P('What is inside', H2)]
toc = [['1', 'Ask at the right moment'], ['2', 'Make it effortless'], ['3', 'Answer every review'], ['4', 'Win the map pack'],
       ['5', 'Turn views into booked jobs'], ['6', 'What never to do'], ['7', 'Your 30-day action plan']]
tt = Table([[P(f'<font color="#0e6fdb"><b>{n}</b></font>', base), P(t, base)] for n, t in toc], colWidths=[26, None])
tt.setStyle(TableStyle([('LINEBELOW', (0, 0), (-1, -1), 0.4, LINE), ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5), ('LEFTPADDING', (0, 0), (-1, -1), 0)]))
story += [tt, PageBreak()]

# --- 1 ask ---
story += [step_head('1', 'Ask at the right moment'), Spacer(1, 8),
          P('The best time to ask for a review is the moment your customer is happiest: right after the work is done and they have seen the result. Wait a week and the feeling (and the motivation) has faded.', BODY),
          P('Who should ask', H2)] + bullets([
              '<b>The tech on site.</b> A quick, genuine "Would you mind leaving us a review? I will text you the link" is one of the most effective asks there is.',
              '<b>An automatic text within an hour of job completion.</b> Consistency beats memory. If asking depends on someone remembering, it will not happen on busy days.',
              '<b>A follow-up nudge two days later</b> to people who have not responded. One reminder is fine. Three is nagging.']) + [
          P('Words that work', H2),
          script('Text message, sent after the job', 'Hi [Name], it is [Tech] from [Business]. Thanks for trusting us today! If you were happy with the work, would you mind leaving a quick Google review? It takes 10 seconds and really helps a local business: [link]'),
          Spacer(1, 6),
          script('Said in person', '"I am glad we got that sorted. If you have a moment tonight, a quick Google review helps us more than you would think. I will text you the link right now so it is one tap."'),
          Spacer(1, 6),
          callout('Pro tip', 'Ask the customer to mention the service and the town if they feel like it ("new water heater in Mesa"). Real, specific reviews help you show up for real, specific searches. Never write the review for them.'),
          PageBreak()]

# --- 2 effortless ---
story += [step_head('2', 'Make it effortless'), Spacer(1, 8),
          P('Every extra step between "I would happily review them" and "review posted" loses you reviews. Your job is to remove the steps.', BODY),
          P('Use a direct review link', H2),
          P('Google Business Profile gives you a shareable link that opens the review box straight away. Find it in your profile under the option to get more reviews, and use that exact link in every message. '
            'A customer should never have to search for your business, find the right listing and hunt for the "Write a review" button.', BODY),
          P('Put the link where customers already are', H2)] + bullets([
              '<b>Text messages</b> beat email. Most people read a text within minutes; an email may sit unread for days.',
              '<b>A QR code</b> that opens the review link, on invoices, receipts, door hangers, business cards and the back of your trucks.',
              '<b>Your email signature</b> and the confirmation email you send when a job is booked.',
              '<b>Your website</b>, with a clear "Leave us a review" link in the footer.']) + [
          P('Keep it honest and simple', H2),
          P('One message, one link, one tap. No accounts to create, no forms, no long explanation. If you can explain the request in two sentences, you have made it easy enough.', BODY),
          Spacer(1, 4),
          callout('Quick check', 'Send the review link to your own phone right now and time how long it takes to post a review. If it takes more than about ten seconds of effort, simplify.'),
          PageBreak()]

# --- 3 answer ---
story += [step_head('3', 'Answer every review'), Spacer(1, 8),
          P('Replying is not just politeness. It shows future customers that a real person is behind the business, and it keeps your profile active. Aim to reply to every review within a day or two.', BODY),
          P('Five-star reviews', H2),
          script('Reply template', 'Thank you, [Name]! We are glad [Tech] could get your [service] sorted so quickly. Thanks for trusting [Business] and for taking the time to say so.'),
          P('Mention something specific from their review so the reply never reads like a copy-paste.', SMALL),
          P('Three-star and lower', H2),
          P('A less-than-perfect review is a chance to show how you handle problems. People reading it are judging your reply as much as the complaint.', BODY)] + bullets([
              'Reply calmly, even if you disagree. Never argue in public.',
              'Thank them, acknowledge the problem, and move the conversation offline.',
              'Fix it if you can, and say so, in one or two sentences.']) + [
          script('Reply template', 'Thank you for letting us know, [Name]. That is not the experience we want anyone to have and I would like to put it right. Please call [Name of owner/manager] on [number] so we can sort this out.'),
          Spacer(1, 6),
          callout('Do not', 'Do not offer discounts or gifts in exchange for changing or deleting a review, and do not post replies that reveal private details about the job or the customer.', accent=colors.HexColor('#e5484d')),
          PageBreak()]

# --- 4 map pack ---
story += [step_head('4', 'Win the map pack'), Spacer(1, 8),
          P('The map with three businesses at the top of local search is where most calls come from. Google says local results are based mainly on three things: <b>relevance</b> (how well your profile matches the search), '
            '<b>distance</b> (how close you are to the searcher) and <b>prominence</b> (how well known and trusted you are, which includes your reviews). You cannot change distance. You can improve the other two.', BODY),
          P('Get your Google Business Profile complete', H2)] + bullets([
              '<b>Pick the right primary category</b> (for example "Plumber" or "HVAC contractor") and add every relevant secondary category.',
              '<b>List every service</b> you offer, with a short plain-English description of each.',
              '<b>Set accurate hours</b>, including holidays, and keep the phone number and address identical everywhere they appear online.',
              '<b>Add real photos</b>: your team, your trucks, finished jobs. Add a few new ones every month.',
              '<b>Post updates</b> such as offers, seasonal tips and finished projects so the profile looks alive.',
              '<b>Answer questions</b> people ask on your profile, and add the common ones yourself.']) + [
          P('Reviews feed ranking', H2),
          P('Google looks at how many reviews you have, how recent they are, your average rating and what the reviews say. That is why a steady weekly trickle beats a one-time burst: recency and consistency look natural and keep your profile fresh.', BODY),
          callout('Weekly habit', 'Fifteen minutes each Friday: reply to new reviews, add two photos, check your hours, and look at where you show up when you search your main service in your own town.'),
          PageBreak()]

# --- 5 book ---
story += [step_head('5', 'Turn views into booked jobs'), Spacer(1, 8),
          P('Reviews and rankings get people to look at you. Your website and phone turn that attention into work.', BODY),
          P('Your website has one job', H2)] + bullets([
              '<b>Make it fast on a phone.</b> Most local searches happen on mobile, often in a hurry.',
              '<b>Put a tap-to-call button</b> at the top and keep it visible as people scroll.',
              '<b>Show your best reviews</b> on the page, near the call button.',
              '<b>One clear next step</b> on every page: call, or request a quote. Not five options.',
              '<b>Say where you work.</b> Name the towns and neighbourhoods you serve.']) + [
          P('Answer the phone (or call back fast)', H2),
          P('A great ranking is wasted if calls go to voicemail. Set up missed-call text-back so anyone you cannot reach gets an immediate message, and try to return every lead the same day.', BODY),
          P('When ads make sense', H2),
          P('SEO and reviews compound over time. Google Ads can put you at the top of the page immediately for high-intent searches such as "emergency plumber near me". Ads stop when the budget stops, so use them to fill the calendar while your long-term assets grow, and track cost per booked job rather than cost per click.', BODY),
          callout('Two paths, one goal', 'Long-term: reviews, local SEO and a strong website compound and keep getting cheaper. Short-term: ads buy visibility today. The strongest businesses do both.'),
          PageBreak()]

# --- 6 never ---
story += [step_head('6', 'What never to do'), Spacer(1, 8),
          P('Shortcuts can get a profile penalised or, worse, damage the trust you are trying to build. Google publishes policies on reviews. In short:', BODY)] + bullets([
              '<b>Never buy or fake reviews</b>, and never write reviews for your own business or ask friends to post glowing reviews that are not real customer experiences.',
              '<b>Never "review gate".</b> Do not screen customers and only send the happy ones to Google. Ask everyone; take the occasional bad review and answer it well.',
              '<b>Never offer rewards</b> such as discounts or prizes in exchange for a review.',
              '<b>Never attack competitors</b> with fake negative reviews.',
              '<b>Never argue with reviewers in public.</b>']) + [
          Spacer(1, 6),
          callout('Why it matters', 'A profile with a mix of genuine four- and five-star reviews and thoughtful replies is more believable than a flawless page of five stars. Believable wins the call.'),
          Spacer(1, 10),
          P('Check Google\'s current review policies before you build your process, as rules can change.', SMALL),
          PageBreak()]

# --- 7 plan ---
story += [step_head('7', 'Your 30-day action plan'), Spacer(1, 8),
          P('Small, steady steps. Tick them off as you go.', BODY),
          KeepTogether([P('Week 1: Foundation', H2), checklist([
              'Claim or verify your Google Business Profile',
              'Choose the right primary and secondary categories',
              'List every service with a short description',
              'Confirm hours, phone number and address match everywhere',
              'Copy your direct review link and test it on your own phone'])]),
          KeepTogether([P('Week 2: Make asking automatic', H2), checklist([
              'Write your review-request text using the template in step 1',
              'Decide who asks in person and when the text goes out',
              'Add a QR code to invoices, business cards and the trucks',
              'Add the review link to your email signature and website footer'])]),
          KeepTogether([P('Week 3: Reply and refresh', H2), checklist([
              'Reply to every existing review (start with the newest)',
              'Save your reply templates so answers take a minute',
              'Upload at least six real photos',
              'Publish your first profile post'])]),
          KeepTogether([P('Week 4: Convert and measure', H2), checklist([
              'Add a tap-to-call button and best reviews to your website',
              'Set up missed-call text-back',
              'Note your review count, average rating and calls this week',
              'Search your main service in your own town and record where you appear'])]),
          PageBreak()]

# --- closing ---
closing = Table([[[
    P('<font color="#ffffff">WANT THIS DONE FOR YOU?</font>', ParagraphStyle('e', parent=EYEBROW, textColor=colors.HexColor('#bfe9e4'))),
    P('<font color="#ffffff"><b>We install the whole system for you, usually live within a week.</b></font>', ParagraphStyle('h', parent=H1, fontSize=22, leading=27, textColor=colors.white)),
    P('<font color="#e6f0ff">Review Dominators builds and runs automated review requests, review replies, Google Business Profile optimisation, smart websites and Google Ads for home-service businesses. No contracts.</font>', ParagraphStyle('b', parent=BODY, textColor=colors.white)),
    Spacer(1, 6),
    P(f'<font color="#ffffff"><b>Book a free growth call:</b></font> <link href="{BOOK_URL}" color="#ffffff"><u>{BOOK_URL.replace("https://", "")}</u></link>', ParagraphStyle('l', parent=base, textColor=colors.white))]]],
    colWidths=[W - 2.3 * inch])
closing.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), BLUE), ('LEFTPADDING', (0, 0), (-1, -1), 22), ('RIGHTPADDING', (0, 0), (-1, -1), 22),
                             ('TOPPADDING', (0, 0), (-1, -1), 22), ('BOTTOMPADDING', (0, 0), (-1, -1), 22)]))
story += [Spacer(1, 30), P('THANK YOU', EYEBROW), P('Put the system to work', H1),
          P('Reviews, rankings and bookings compound. Start with the 30-day plan, keep the weekly habit, and let the results build.', LEAD),
          Spacer(1, 12), closing, Spacer(1, 16),
          P('This guide is general information for small local businesses. Results depend on your market, your service quality and how consistently you follow the process. '
            'Google, Google Business Profile and Google Ads are trademarks of Google LLC; Review Dominators is not affiliated with Google.', SMALL)]

doc.build(story)
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
