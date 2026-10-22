"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Heart, Reply } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

export function EventComments() {
  // Mock comments data
  const [comments, setComments] = useState([
    {
      id: 1,
      user: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "This event looks amazing! I'm really looking forward to the keynote speech by Dr. Jane Smith. Her research on AI ethics has been groundbreaking.",
      date: "2025-03-10T14:32:00",
      likes: 5,
      liked: false,
      replies: [
        {
          id: 11,
          user: {
            name: "Michael Chen",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          content:
            "I agree! I've read her latest paper and it's fascinating. Hope there will be a Q&A session after her talk.",
          date: "2025-03-10T15:45:00",
          likes: 2,
          liked: false,
        },
      ],
      showReplyForm: false,
    },
    {
      id: 2,
      user: {
        name: "David Wilson",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "Will the workshops be recorded for those who can't attend all sessions simultaneously? I'm particularly interested in both the AI and Blockchain tracks.",
      date: "2025-03-12T09:15:00",
      likes: 3,
      liked: false,
      replies: [],
      showReplyForm: false,
    },
    {
      id: 3,
      user: {
        name: "Emily Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "I attended last year's summit and it was incredibly informative. The networking opportunities alone were worth it. Highly recommend!",
      date: "2025-03-14T16:20:00",
      likes: 8,
      liked: false,
      replies: [],
      showReplyForm: false,
    },
  ])

  const toggleLike = (commentId: number, isReply = false, parentId?: number) => {
    setComments(
      comments.map((comment) => {
        if (!isReply && comment.id === commentId) {
          return {
            ...comment,
            likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            liked: !comment.liked,
          }
        } else if (isReply && parentId) {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    likes: reply.liked ? reply.likes - 1 : reply.likes + 1,
                    liked: !reply.liked,
                  }
                }
                return reply
              }),
            }
          }
        }
        return comment
      }),
    )
  }

  const toggleReplyForm = (commentId: number) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            showReplyForm: !comment.showReplyForm,
          }
        }
        return comment
      }),
    )
  }

  const addReply = (commentId: number, content: string) => {
    if (!content.trim()) return

    const newReply = {
      id: Math.floor(Math.random() * 1000),
      user: {
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content,
      date: new Date().toISOString(),
      likes: 0,
      liked: false,
    }

    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...comment.replies, newReply],
            showReplyForm: false,
          }
        }
        return comment
      }),
    )
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                  <AvatarFallback>
                    {comment.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{comment.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(comment.date), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            </div>

            <p className="mb-3 text-sm">{comment.content}</p>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" onClick={() => toggleLike(comment.id)}>
                <Heart className={cn("h-4 w-4", comment.liked ? "fill-red-500 text-red-500" : "")} />
                <span className="text-xs">{comment.likes}</span>
              </Button>

              <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" onClick={() => toggleReplyForm(comment.id)}>
                <Reply className="h-4 w-4" />
                <span className="text-xs">Reply</span>
              </Button>
            </div>
          </div>

          {/* Reply form */}
          {comment.showReplyForm && (
            <div className="ml-8 space-y-2">
              <Textarea placeholder="Write a reply..." className="min-h-[80px]" id={`reply-${comment.id}`} />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const textarea = document.getElementById(`reply-${comment.id}`) as HTMLTextAreaElement
                    addReply(comment.id, textarea.value)
                    textarea.value = ""
                  }}
                >
                  Post Reply
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleReplyForm(comment.id)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="ml-8 space-y-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={reply.user.avatar} alt={reply.user.name} />
                        <AvatarFallback>
                          {reply.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{reply.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(reply.date), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mb-3 text-sm">{reply.content}</p>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2"
                    onClick={() => toggleLike(reply.id, true, comment.id)}
                  >
                    <Heart className={cn("h-3.5 w-3.5", reply.liked ? "fill-red-500 text-red-500" : "")} />
                    <span className="text-xs">{reply.likes}</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
