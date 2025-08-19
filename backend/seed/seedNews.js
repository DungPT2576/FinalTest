// Seed 9 random news
require('dotenv').config();
const mongoose = require('mongoose');
const News = require('../models/News');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true });
    const admin = await User.findOne({ role:'ADMIN' });
    const adminId = admin? admin._id : undefined;
    const sampleBodies = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae.',
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
      'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.',
      'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.',
      'At vero eos et accusamus et iusto odio dignissimos ducimus.',
      'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.',
      'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet.',
      'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit.',
      'On the other hand, we denounce with righteous indignation.'
    ];
    const tagsList = [['Dealer','Electric'], ['Update'], ['Market','Insight'], ['Safety'], ['Launch'], ['Promo'], ['Tip'], ['Event'], ['Tech']];
    await News.deleteMany({});
    const now = Date.now();
    const docs = await News.insertMany(sampleBodies.map((body,i)=>({
      title: 'News '+(i+1),
      summary: body.slice(0,120),
      content: body + '\n\n' + body,
      coverImage: 'https://picsum.photos/seed/news'+i+'/800/400',
      tags: tagsList[i],
      createdBy: adminId,
      publishedAt: new Date(now - i*3600*1000)
    })));
    console.log('Inserted', docs.length, 'news');
    process.exit(0);
  } catch (e){ console.error(e); process.exit(1); }
})();
