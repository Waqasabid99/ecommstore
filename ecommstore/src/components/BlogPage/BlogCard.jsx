'use client';
import { ArrowRight, Bookmark, Calendar, Clock, Eye, User } from "lucide-react";

const BlogCard = ({ post, featured = false }) => {
  return (
    <article className={`bg-white border border-(--border-default) rounded-xl overflow-hidden hover:shadow-xl transition-all group ${featured ? 'lg:col-span-2' : ''}`}>
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${featured ? 'h-80' : 'h-48'}`}
        />
        <div className="absolute top-4 left-4">
          <span className="bg-(--bg-primary) text-(--text-inverse) text-xs font-semibold px-3 py-1.5 rounded-full">
            {post.category}
          </span>
        </div>
        <button className="absolute top-4 right-4 bg-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-(--bg-primary) hover:text-(--text-inverse) transition-all opacity-0 group-hover:opacity-100">
          <Bookmark size={18} />
        </button>
      </div>

      {/* Content */}
      <div className={`p-6 ${featured ? 'md:p-8' : ''}`}>
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-(--text-secondary) mb-3">
          <span className="flex items-center gap-1">
            <User size={14} />
            {post.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {post.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {post.readTime}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={14} />
            {post.views}
          </span>
        </div>

        {/* Title */}
        <h3 className={`font-bold text-(--text-heading) mb-3 group-hover:text-(--color-brand-primary) transition-colors ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className={`text-(--text-secondary) mb-4 leading-relaxed ${featured ? 'text-base' : 'text-sm'}`}>
          {post.excerpt}
        </p>

        {/* Read More */}
        <button className="flex items-center gap-2 text-(--color-brand-primary) font-semibold text-sm hover:gap-3 transition-all">
          Read More
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
};

export default BlogCard
