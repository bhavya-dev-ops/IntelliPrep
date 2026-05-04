import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ status: 'error', message: 'Username is required' }, { status: 400 });
  }

  try {
    // Attempting to fetch from a more reliable alternative API provider
    const response = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${username}`, {
      next: { revalidate: 3600 } 
    });
    
    if (!response.ok) {
      throw new Error(`LeetCode Service Error: ${response.status}`);
    }

    const rawData = await response.json();
    
    // Normalize the data to match our existing Stats interface
    const normalizedData = {
      status: 'success',
      totalSolved: rawData.totalSolved || 0,
      totalQuestions: rawData.totalQuestions || 2400,
      easySolved: rawData.easySolved || 0,
      mediumSolved: rawData.mediumSolved || 0,
      hardSolved: rawData.hardSolved || 0,
      acceptanceRate: rawData.acceptanceRate || 0,
      ranking: rawData.ranking || 0,
      contributionPoints: 0,
      reputation: 0
    };

    return NextResponse.json(normalizedData);
  } catch (err: any) {
    console.error('Server-side LeetCode Fetch Error:', err);
    return NextResponse.json({ 
      status: 'error', 
      message: 'LeetCode services are currently busy. Please try again in a few minutes.' 
    }, { status: 503 }); // 503 is more accurate for service being down
  }
}
